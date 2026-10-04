import { Expense } from './types';
import { parseISO, differenceInDays, differenceInMonths, isWithinInterval, startOfMonth, endOfMonth, format, subMonths, eachDayOfInterval, startOfDay, endOfDay, isSameDay, addDays, subDays } from 'date-fns';

// ============================================
// FINANCIAL REPLAY & TIME MACHINE
// ============================================

export interface ReplayEvent {
  date: string;
  type: 'transaction' | 'milestone' | 'anomaly' | 'velocity_change';
  description: string;
  amount?: number;
  category?: string;
  balance?: number;
  severity?: 'low' | 'medium' | 'high';
}

export function generateReplayEvents(expenses: Expense[], startDate: Date, endDate: Date): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  let runningBalance = 0;
  let previousWeekSpending = 0;
  let currentWeekSpending = 0;
  let weekStart = days[0];
  
  // Calculate daily events
  days.forEach((day, index) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = expenses.filter(e => e.date === dayStr);
    const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (dayTotal > 0) {
      runningBalance -= dayTotal;
      
      // Add transaction events
      dayExpenses.forEach(expense => {
        events.push({
          date: dayStr,
          type: 'transaction',
          description: `${expense.note || expense.category}`,
          amount: expense.amount,
          category: expense.category,
          balance: runningBalance
        });
      });
      
      // Detect anomalies
      const avgDaily = calculateAverageDailySpending(expenses, day, 30);
      if (dayTotal > avgDaily * 2 && avgDaily > 0) {
        events.push({
          date: dayStr,
          type: 'anomaly',
          description: `Unusually high spending: ${formatCurrency(dayTotal)}`,
          amount: dayTotal,
          balance: runningBalance,
          severity: dayTotal > avgDaily * 3 ? 'high' : 'medium'
        });
      }
    }
    
    // Weekly velocity check
    if (differenceInDays(day, weekStart) >= 7 || index === days.length - 1) {
      if (previousWeekSpending > 0) {
        const velocityChange = ((currentWeekSpending - previousWeekSpending) / previousWeekSpending) * 100;
        if (Math.abs(velocityChange) > 30) {
          events.push({
            date: dayStr,
            type: 'velocity_change',
            description: `Spending velocity ${velocityChange > 0 ? 'increased' : 'decreased'} ${Math.abs(Math.round(velocityChange))}%`,
            amount: currentWeekSpending,
            balance: runningBalance,
            severity: Math.abs(velocityChange) > 50 ? 'high' : 'low'
          });
        }
      }
      previousWeekSpending = currentWeekSpending;
      currentWeekSpending = 0;
      weekStart = day;
    }
    
    currentWeekSpending += dayTotal;
    
    // Monthly milestones
    if (day.getDate() === 1 && index > 0) {
      const monthStr = format(subDays(day, 1), 'MMMM');
      events.push({
        date: dayStr,
        type: 'milestone',
        description: `${monthStr} completed`,
        balance: runningBalance
      });
    }
  });
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ============================================
// GHOST MONEY
// ============================================

export interface GhostMoneyBreakdown {
  total: number;
  recurring: number;
  predicted: number;
  items: {
    description: string;
    amount: number;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  }[];
}

export function calculateGhostMoney(expenses: Expense[], currentDate: Date = new Date()): GhostMoneyBreakdown | null {
  if (expenses.length < 10) return null; // Need enough data
  
  const items: GhostMoneyBreakdown['items'] = [];
  let recurringTotal = 0;
  let predictedTotal = 0;
  
  // Detect recurring expenses
  const recurring = detectRecurringExpenses(expenses);
  recurring.forEach(pattern => {
    const avgAmount = pattern.total / pattern.count;
    const nextDueDate = getNextDueDate(pattern.expenses, currentDate);
    
    if (nextDueDate && differenceInDays(nextDueDate, currentDate) <= 30) {
      items.push({
        description: `Recurring ${pattern.category}`,
        amount: avgAmount,
        confidence: pattern.count >= 3 ? 'high' : 'medium',
        reason: `Occurs approximately every ${pattern.averageInterval} days`
      });
      recurringTotal += avgAmount;
    }
  });
  
  // Predict end-of-month spending based on history
  const monthEnd = endOfMonth(currentDate);
  const daysRemaining = differenceInDays(monthEnd, currentDate);
  
  if (daysRemaining > 0 && daysRemaining < 15) {
    const avgDaily = calculateAverageDailySpending(expenses, currentDate, 60);
    const predicted = avgDaily * daysRemaining;
    
    if (predicted > 0) {
      items.push({
        description: `Predicted spending (next ${daysRemaining} days)`,
        amount: predicted,
        confidence: 'medium',
        reason: `Based on your average daily spending of ${formatCurrency(avgDaily)}`
      });
      predictedTotal += predicted;
    }
  }
  
  const total = recurringTotal + predictedTotal;
  
  if (total === 0) return null;
  
  return {
    total,
    recurring: recurringTotal,
    predicted: predictedTotal,
    items
  };
}

// ============================================
// SPENDING DNA
// ============================================

export interface SpendingDNA {
  necessity: number;
  impulse: number;
  social: number;
  typicality: number;
  signals: string[];
}

export function calculateSpendingDNA(expense: Expense, allExpenses: Expense[]): SpendingDNA {
  const signals: string[] = [];
  
  // Necessity score (based on category and patterns)
  const necessityCategories = ['food', 'transport', 'bills', 'health'];
  let necessity = necessityCategories.includes(expense.category) ? 70 : 30;
  
  // Check if this is a recurring pattern
  const similarExpenses = allExpenses.filter(e => 
    e.category === expense.category && 
    Math.abs(e.amount - expense.amount) < expense.amount * 0.2 &&
    e.id !== expense.id
  );
  
  if (similarExpenses.length >= 2) {
    necessity += 20;
    signals.push('Recurring pattern detected');
  }
  
  // Impulse score (based on timing and amount)
  let impulse = 20;
  const hour = parseISO(expense.createdAt).getHours();
  if (hour >= 22 || hour <= 5) {
    impulse += 30;
    signals.push('Late-night purchase');
  }
  
  // Check if amount is unusual for this category
  const categoryExpenses = allExpenses.filter(e => e.category === expense.category);
  if (categoryExpenses.length >= 3) {
    const avgAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
    if (expense.amount > avgAmount * 1.5) {
      impulse += 25;
      signals.push('Unusually large for category');
    }
  }
  
  // Social score (based on note keywords and patterns)
  let social = 10;
  const socialKeywords = ['restaurant', 'dinner', 'lunch', 'coffee', 'bar', 'party', 'gift', 'friends'];
  if (expense.note && socialKeywords.some(keyword => expense.note!.toLowerCase().includes(keyword))) {
    social += 40;
    signals.push('Social context detected');
  }
  
  // Typicality score (how typical is this purchase for you)
  let typicality = 50;
  if (similarExpenses.length >= 3) {
    typicality = 85;
    signals.push('Very typical purchase');
  } else if (similarExpenses.length === 0) {
    typicality = 30;
    signals.push('Unique purchase');
  }
  
  // Normalize scores to 0-100
  necessity = Math.min(100, Math.max(0, necessity));
  impulse = Math.min(100, Math.max(0, impulse));
  social = Math.min(100, Math.max(0, social));
  typicality = Math.min(100, Math.max(0, typicality));
  
  return {
    necessity,
    impulse,
    social,
    typicality,
    signals
  };
}

// ============================================
// ANOMALY DETECTOR
// ============================================

export interface Anomaly {
  type: 'amount' | 'frequency' | 'category' | 'timing';
  description: string;
  severity: 'low' | 'medium' | 'high';
  expenses: Expense[];
  explanation: string;
}

export function detectAnomalies(expenses: Expense[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  if (expenses.length < 10) return anomalies;
  
  // Amount anomalies
  const categoryAmounts: Record<string, number[]> = {};
  expenses.forEach(e => {
    if (!categoryAmounts[e.category]) categoryAmounts[e.category] = [];
    categoryAmounts[e.category].push(e.amount);
  });
  
  Object.entries(categoryAmounts).forEach(([category, amounts]) => {
    if (amounts.length < 3) return;
    
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const max = Math.max(...amounts);
    
    if (max > avg * 3) {
      const outlier = expenses.find(e => e.category === category && e.amount === max);
      if (outlier) {
        anomalies.push({
          type: 'amount',
          description: `Unusually large ${category} purchase`,
          severity: max > avg * 5 ? 'high' : 'medium',
          expenses: [outlier],
          explanation: `Your average ${category} purchase is ${formatCurrency(avg)}, but this was ${formatCurrency(max)}`
        });
      }
    }
  });
  
  // Frequency anomalies
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const lastMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    const lm = subMonths(now, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  
  const categoryCounts: Record<string, { thisMonth: number; lastMonth: number }> = {};
  thisMonth.forEach(e => {
    if (!categoryCounts[e.category]) categoryCounts[e.category] = { thisMonth: 0, lastMonth: 0 };
    categoryCounts[e.category].thisMonth++;
  });
  
  lastMonth.forEach(e => {
    if (!categoryCounts[e.category]) categoryCounts[e.category] = { thisMonth: 0, lastMonth: 0 };
    categoryCounts[e.category].lastMonth++;
  });
  
  Object.entries(categoryCounts).forEach(([category, counts]) => {
    if (counts.lastMonth > 0 && counts.thisMonth > counts.lastMonth * 1.5) {
      const increase = ((counts.thisMonth - counts.lastMonth) / counts.lastMonth) * 100;
      anomalies.push({
        type: 'frequency',
        description: `${category} spending increased ${Math.round(increase)}%`,
        severity: increase > 100 ? 'high' : 'medium',
        expenses: thisMonth.filter(e => e.category === category),
        explanation: `You made ${counts.thisMonth} ${category} purchases this month vs ${counts.lastMonth} last month`
      });
    }
  });
  
  return anomalies;
}

// ============================================
// FINANCIAL AUTOPSY
// ============================================

export interface AutopsyResult {
  total: number;
  breakdown: {
    necessary: number;
    lifestyle: number;
    impulse: number;
    recurring: number;
    other: number;
  };
  insights: string[];
  topContributors: {
    description: string;
    amount: number;
    count: number;
  }[];
}

export function performFinancialAutopsy(expenses: Expense[], startDate: Date, endDate: Date): AutopsyResult | null {
  const periodExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: startDate, end: endDate });
  });
  
  if (periodExpenses.length === 0) return null;
  
  const total = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Categorize by behavior
  const necessaryCategories = ['food', 'transport', 'bills', 'health'];
  const lifestyleCategories = ['entertainment', 'shopping'];
  
  let necessary = 0;
  let lifestyle = 0;
  let impulse = 0;
  let recurring = 0;
  let other = 0;
  
  const recurringPatterns = detectRecurringExpenses(expenses);
  const recurringExpenseIds = new Set(recurringPatterns.flatMap(p => p.expenses.map(e => e.id)));
  
  periodExpenses.forEach(e => {
    if (recurringExpenseIds.has(e.id)) {
      recurring += e.amount;
    } else if (necessaryCategories.includes(e.category)) {
      necessary += e.amount;
    } else if (lifestyleCategories.includes(e.category)) {
      lifestyle += e.amount;
    } else {
      // Check for impulse indicators
      const dna = calculateSpendingDNA(e, expenses);
      if (dna.impulse > 60) {
        impulse += e.amount;
      } else {
        other += e.amount;
      }
    }
  });
  
  // Generate insights
  const insights: string[] = [];
  
  // Find small purchases that add up
  const smallPurchases = periodExpenses.filter(e => e.amount < 500);
  const smallTotal = smallPurchases.reduce((sum, e) => sum + e.amount, 0);
  if (smallPurchases.length >= 5 && smallTotal > total * 0.2) {
    insights.push(`${smallPurchases.length} purchases under ${formatCurrency(500)} collectively accounted for ${formatCurrency(smallTotal)}`);
  }
  
  // Find largest contributor
  const categoryTotals: Record<string, number> = {};
  periodExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  
  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
  if (topCategory && topCategory[1] > total * 0.3) {
    insights.push(`${topCategory[0]} accounted for ${Math.round((topCategory[1] / total) * 100)}% of spending`);
  }
  
  // Top contributors
  const topContributors = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      description: category,
      amount,
      count: periodExpenses.filter(e => e.category === category).length
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  return {
    total,
    breakdown: { necessary, lifestyle, impulse, recurring, other },
    insights,
    topContributors
  };
}

// ============================================
// PAST VS CURRENT
// ============================================

export interface PeriodComparison {
  period1: { start: Date; end: Date; label: string };
  period2: { start: Date; end: Date; label: string };
  metrics: {
    label: string;
    period1Value: number;
    period2Value: number;
    change: number;
    format: 'currency' | 'number' | 'percent';
  }[];
}

export function comparePeriods(expenses: Expense[], period1Start: Date, period1End: Date, period2Start: Date, period2End: Date): PeriodComparison | null {
  const p1Expenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: period1Start, end: period1End });
  });
  
  const p2Expenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: period2Start, end: period2End });
  });
  
  if (p1Expenses.length === 0 || p2Expenses.length === 0) return null;
  
  const p1Total = p1Expenses.reduce((sum, e) => sum + e.amount, 0);
  const p2Total = p2Expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const p1Avg = p1Total / p1Expenses.length;
  const p2Avg = p2Total / p2Expenses.length;
  
  const p1Largest = Math.max(...p1Expenses.map(e => e.amount));
  const p2Largest = Math.max(...p2Expenses.map(e => e.amount));
  
  // Calculate impulse-like purchases (simplified)
  const p1Impulse = p1Expenses.filter(e => {
    const hour = parseISO(e.createdAt).getHours();
    return hour >= 22 || hour <= 5;
  }).length;
  
  const p2Impulse = p2Expenses.filter(e => {
    const hour = parseISO(e.createdAt).getHours();
    return hour >= 22 || hour <= 5;
  }).length;
  
  const metrics: PeriodComparison['metrics'] = [
    {
      label: 'Total spending',
      period1Value: p1Total,
      period2Value: p2Total,
      change: ((p2Total - p1Total) / p1Total) * 100,
      format: 'currency'
    },
    {
      label: 'Average purchase',
      period1Value: p1Avg,
      period2Value: p2Avg,
      change: ((p2Avg - p1Avg) / p1Avg) * 100,
      format: 'currency'
    },
    {
      label: 'Number of purchases',
      period1Value: p1Expenses.length,
      period2Value: p2Expenses.length,
      change: ((p2Expenses.length - p1Expenses.length) / p1Expenses.length) * 100,
      format: 'number'
    },
    {
      label: 'Largest purchase',
      period1Value: p1Largest,
      period2Value: p2Largest,
      change: ((p2Largest - p1Largest) / p1Largest) * 100,
      format: 'currency'
    },
    {
      label: 'Late-night purchases',
      period1Value: p1Impulse,
      period2Value: p2Impulse,
      change: p1Impulse > 0 ? ((p2Impulse - p1Impulse) / p1Impulse) * 100 : 0,
      format: 'number'
    }
  ];
  
  return {
    period1: { start: period1Start, end: period1End, label: format(period1Start, 'MMM yyyy') },
    period2: { start: period2Start, end: period2End, label: format(period2Start, 'MMM yyyy') },
    metrics
  };
}

// ============================================
// FINANCIAL TRAJECTORY
// ============================================

export interface Trajectory {
  bestCase: number;
  expected: number;
  higherSpending: number;
  explanation: string;
}

export function calculateTrajectory(expenses: Expense[], currentDate: Date = new Date()): Trajectory | null {
  if (expenses.length < 20) return null;
  
  const monthEnd = endOfMonth(currentDate);
  const daysRemaining = differenceInDays(monthEnd, currentDate);
  
  if (daysRemaining <= 0) return null;
  
  // Calculate recent spending patterns
  const last30Days = expenses.filter(e => {
    const d = parseISO(e.date);
    return differenceInDays(currentDate, d) <= 30;
  });
  
  const avgDaily = last30Days.reduce((sum, e) => sum + e.amount, 0) / 30;
  
  // Calculate standard deviation for scenarios
  const dailyTotals: Record<string, number> = {};
  last30Days.forEach(e => {
    const day = e.date;
    dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
  });
  
  const dailyValues = Object.values(dailyTotals);
  const variance = dailyValues.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / dailyValues.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate scenarios
  const expectedSpend = avgDaily * daysRemaining;
  const bestCaseSpend = (avgDaily - stdDev * 0.5) * daysRemaining;
  const higherSpend = (avgDaily + stdDev * 0.5) * daysRemaining;
  
  return {
    bestCase: Math.max(0, bestCaseSpend),
    expected: expectedSpend,
    higherSpending: higherSpend,
    explanation: `Based on your average daily spending of ${formatCurrency(avgDaily)} over the last 30 days`
  };
}

// ============================================
// SPENDING HEATMAP
// ============================================

export interface HeatmapData {
  date: string;
  amount: number;
  count: number;
  intensity: number;
}

export function generateHeatmapData(expenses: Expense[], startDate: Date, endDate: Date): HeatmapData[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = expenses.filter(e => e.date === dayStr);
    const amount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      date: dayStr,
      amount,
      count: dayExpenses.length,
      intensity: 0 // Will be calculated after finding max
    };
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateAverageDailySpending(expenses: Expense[], referenceDate: Date, lookbackDays: number): number {
  const startDate = subDays(referenceDate, lookbackDays);
  const periodExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: startDate, end: referenceDate });
  });
  
  const total = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  return total / lookbackDays;
}

interface RecurringPattern {
  category: string;
  expenses: Expense[];
  total: number;
  count: number;
  averageInterval: number;
}

function detectRecurringExpenses(expenses: Expense[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  
  // Group by category
  const byCategory: Record<string, Expense[]> = {};
  expenses.forEach(e => {
    if (!byCategory[e.category]) byCategory[e.category] = [];
    byCategory[e.category].push(e);
  });
  
  Object.entries(byCategory).forEach(([category, categoryExpenses]) => {
    if (categoryExpenses.length < 2) return;
    
    // Sort by date
    const sorted = categoryExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Check for similar amounts
    const amounts = sorted.map(e => e.amount);
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const similar = sorted.filter(e => Math.abs(e.amount - avg) < avg * 0.2);
    
    if (similar.length >= 2) {
      // Calculate average interval
      const intervals: number[] = [];
      for (let i = 1; i < similar.length; i++) {
        const days = differenceInDays(parseISO(similar[i].date), parseISO(similar[i - 1].date));
        if (days > 0 && days < 90) intervals.push(days);
      }
      
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
        
        patterns.push({
          category,
          expenses: similar,
          total: similar.reduce((s, e) => s + e.amount, 0),
          count: similar.length,
          averageInterval: Math.round(avgInterval)
        });
      }
    }
  });
  
  return patterns;
}

function getNextDueDate(expenses: Expense[], currentDate: Date): Date | null {
  if (expenses.length < 2) return null;
  
  const sorted = expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastDate = parseISO(sorted[sorted.length - 1].date);
  
  // Calculate average interval
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date));
    if (days > 0 && days < 90) intervals.push(days);
  }
  
  if (intervals.length === 0) return null;
  
  const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
  return addDays(lastDate, Math.round(avgInterval));
}

function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
  return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
