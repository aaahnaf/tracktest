import { Expense, WorthItRating } from './types';
import { parseISO, differenceInDays, differenceInMonths, isWithinInterval, startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

// Natural Language Search
export function parseNaturalQuery(query: string, expenses: Expense[]): Expense[] {
  const q = query.toLowerCase().trim();
  
  // "How much did I spend on [category] [timeframe]?"
  const howMuchMatch = q.match(/how much.*(?:spend|spent).*(?:on|in|for)\s+(\w+)(?:\s+(last\s+)?(month|week|year))?/i);
  if (howMuchMatch) {
    const category = howMuchMatch[1];
    const timeframe = howMuchMatch[3];
    return filterByCategoryAndTimeframe(expenses, category, timeframe);
  }
  
  // "What did I buy for more than [amount]?"
  const amountMatch = q.match(/(?:what|show).*(?:buy|bought|spent|purchase).*(?:more than|over|above|>)\s*([৳$€£₹]?\s*\d[\d,]*)/i);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1].replace(/[^\d.]/g, ''));
    return expenses.filter(e => e.amount > amount);
  }
  
  // "Show purchases I didn't think were worth it"
  if (q.includes('not worth') || q.includes('worth it') || q.includes('regret')) {
    return expenses.filter(e => e.worthItRating === 'not-really' || e.worthItRating === 'no');
  }
  
  // "How much did I spend on weekends?"
  if (q.includes('weekend')) {
    return expenses.filter(e => {
      const day = parseISO(e.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
  }
  
  // "Show my [category] purchases"
  const categoryMatch = q.match(/(?:show|find|what).*(?:my|the)?\s*(\w+)\s*(?:purchases?|expenses?|spending)/i);
  if (categoryMatch) {
    const category = categoryMatch[1];
    return filterByCategory(expenses, category);
  }
  
  // "What did I spend on [keyword]?"
  const keywordMatch = q.match(/(?:what|show|find).*(?:spend|spent|buy|bought|purchase).*(?:on|for|about)\s+(.+)/i);
  if (keywordMatch) {
    const keyword = keywordMatch[1].trim();
    return expenses.filter(e => 
      e.note.toLowerCase().includes(keyword) ||
      e.category.toLowerCase().includes(keyword) ||
      e.memoryNote?.toLowerCase().includes(keyword) ||
      e.productName?.toLowerCase().includes(keyword) ||
      e.merchant?.toLowerCase().includes(keyword)
    );
  }
  
  // Fallback to simple text search
  return expenses.filter(e => 
    e.note.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.memoryNote?.toLowerCase().includes(q) ||
    e.productName?.toLowerCase().includes(q) ||
    e.merchant?.toLowerCase().includes(q)
  );
}

function filterByCategory(expenses: Expense[], category: string): Expense[] {
  return expenses.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
}

function filterByCategoryAndTimeframe(expenses: Expense[], category: string, timeframe?: string): Expense[] {
  let filtered = filterByCategory(expenses, category);
  
  if (timeframe) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    if (timeframe.includes('last')) {
      startDate = subMonths(startOfMonth(now), 1);
      endDate = endOfMonth(startDate);
    } else if (timeframe === 'month') {
      startDate = startOfMonth(now);
    } else if (timeframe === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      return filtered;
    }
    
    filtered = filtered.filter(e => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: startDate, end: endDate });
    });
  }
  
  return filtered;
}

// Pattern Detection
export interface Pattern {
  type: 'category' | 'merchant' | 'time' | 'price' | 'recurring';
  description: string;
  expenses: Expense[];
  total: number;
  count: number;
}

export function detectPatterns(expenses: Expense[]): Pattern[] {
  const patterns: Pattern[] = [];
  
  // Detect category patterns with negative ratings
  const categoryRatings: Record<string, { total: number; count: number; negative: number; expenses: Expense[] }> = {};
  expenses.forEach(e => {
    if (!categoryRatings[e.category]) {
      categoryRatings[e.category] = { total: 0, count: 0, negative: 0, expenses: [] };
    }
    categoryRatings[e.category].total += e.amount;
    categoryRatings[e.category].count++;
    categoryRatings[e.category].expenses.push(e);
    if (e.worthItRating === 'not-really' || e.worthItRating === 'no') {
      categoryRatings[e.category].negative++;
    }
  });
  
  Object.entries(categoryRatings).forEach(([category, data]) => {
    if (data.negative >= 3 && data.negative / data.count >= 0.5) {
      patterns.push({
        type: 'category',
        description: `You marked ${data.negative} ${category} purchases as not worth it`,
        expenses: data.expenses.filter(e => e.worthItRating === 'not-really' || e.worthItRating === 'no'),
        total: data.expenses.filter(e => e.worthItRating === 'not-really' || e.worthItRating === 'no').reduce((s, e) => s + e.amount, 0),
        count: data.negative
      });
    }
  });
  
  // Detect merchant patterns
  const merchantExpenses: Record<string, Expense[]> = {};
  expenses.forEach(e => {
    if (e.merchant) {
      if (!merchantExpenses[e.merchant]) merchantExpenses[e.merchant] = [];
      merchantExpenses[e.merchant].push(e);
    }
  });
  
  Object.entries(merchantExpenses).forEach(([merchant, exps]) => {
    if (exps.length >= 3) {
      patterns.push({
        type: 'merchant',
        description: `You've made ${exps.length} purchases at ${merchant}`,
        expenses: exps,
        total: exps.reduce((s, e) => s + e.amount, 0),
        count: exps.length
      });
    }
  });
  
  // Detect recurring expenses
  const recurringPatterns = detectRecurringExpenses(expenses);
  patterns.push(...recurringPatterns);
  
  return patterns;
}

function detectRecurringExpenses(expenses: Expense[]): Pattern[] {
  const patterns: Pattern[] = [];
  const now = new Date();
  
  // Group by category + similar amount (within 10%)
  const groups: Record<string, Expense[]> = {};
  expenses.forEach(e => {
    const key = `${e.category}_${Math.round(e.amount / 100) * 100}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  
  Object.entries(groups).forEach(([key, exps]) => {
    if (exps.length >= 3) {
      // Check if they're spread across multiple months
      const months = new Set(exps.map(e => format(parseISO(e.date), 'yyyy-MM')));
      if (months.size >= 3) {
        const [category, amount] = key.split('_');
        patterns.push({
          type: 'recurring',
          description: `You've spent around ${amount} on ${category} every month recently`,
          expenses: exps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          total: exps.reduce((s, e) => s + e.amount, 0),
          count: exps.length
        });
      }
    }
  });
  
  return patterns;
}

// Price Memory
export function findSimilarPurchases(expenses: Expense[], currentExpense: Partial<Expense>): Expense[] {
  return expenses.filter(e => {
    if (e.id === currentExpense.id) return false;
    
    // Match by category
    if (e.category !== currentExpense.category) return false;
    
    // Match by product name if available
    if (currentExpense.productName && e.productName) {
      const similarity = calculateSimilarity(e.productName, currentExpense.productName);
      if (similarity > 0.6) return true;
    }
    
    // Match by note keywords
    if (currentExpense.note && e.note) {
      const similarity = calculateSimilarity(e.note, currentExpense.note);
      if (similarity > 0.6) return true;
    }
    
    return false;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const common = words1.filter(w => words2.includes(w));
  const total = new Set([...words1, ...words2]).size;
  
  return total > 0 ? common.length / total : 0;
}

// Worth-it Analytics
export function calculateWorthItStats(expenses: Expense[]) {
  const rated = expenses.filter(e => e.worthItRating);
  if (rated.length === 0) return null;
  
  const positive = rated.filter(e => e.worthItRating === 'absolutely' || e.worthItRating === 'mostly');
  const percentage = Math.round((positive.length / rated.length) * 100);
  
  // By category
  const byCategory: Record<string, { total: number; positive: number }> = {};
  rated.forEach(e => {
    if (!byCategory[e.category]) {
      byCategory[e.category] = { total: 0, positive: 0 };
    }
    byCategory[e.category].total++;
    if (e.worthItRating === 'absolutely' || e.worthItRating === 'mostly') {
      byCategory[e.category].positive++;
    }
  });
  
  const categoryStats = Object.entries(byCategory)
    .map(([category, data]) => ({
      category,
      percentage: Math.round((data.positive / data.total) * 100),
      count: data.total
    }))
    .filter(c => c.count >= 2)
    .sort((a, b) => b.percentage - a.percentage);
  
  return {
    percentage,
    total: rated.length,
    positive: positive.length,
    categoryStats
  };
}

// Impulse Patterns
export function detectImpulsePatterns(expenses: Expense[]): string[] {
  const insights: string[] = [];
  const rated = expenses.filter(e => e.worthItRating);
  
  if (rated.length < 5) return insights;
  
  // Late night purchases
  const lateNight = rated.filter(e => {
    const hour = parseISO(e.createdAt).getHours();
    return hour >= 22 || hour <= 5;
  });
  
  if (lateNight.length >= 3) {
    const negative = lateNight.filter(e => e.worthItRating === 'not-really' || e.worthItRating === 'no');
    if (negative.length / lateNight.length > 0.5) {
      insights.push('You marked several late-night purchases as not worth it');
    }
  }
  
  // Small purchases
  const small = rated.filter(e => e.amount < 500);
  if (small.length >= 5) {
    const positive = small.filter(e => e.worthItRating === 'absolutely' || e.worthItRating === 'mostly');
    if (positive.length / small.length > 0.7) {
      insights.push('Purchases under ৳500 are often marked worthwhile');
    }
  }
  
  return insights;
}

// Monthly Recap
export function generateMonthlyRecap(expenses: Expense[], month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  const monthExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });
  
  if (monthExpenses.length === 0) return null;
  
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const count = monthExpenses.length;
  
  // By category
  const byCategory: Record<string, number> = {};
  monthExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  
  // Memories
  const withMemories = monthExpenses.filter(e => e.memoryNote || e.worthItRating);
  const worthItCount = monthExpenses.filter(e => e.worthItRating).length;
  const worthItPositive = monthExpenses.filter(e => 
    e.worthItRating === 'absolutely' || e.worthItRating === 'mostly'
  ).length;
  
  // Insights
  const insights: string[] = [];
  const categoryEntries = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  if (categoryEntries.length > 0) {
    insights.push(`Your top category was ${categoryEntries[0][0]}`);
  }
  
  return {
    month: format(month, 'MMMM yyyy'),
    total,
    count,
    byCategory,
    withMemories: withMemories.length,
    worthIt: { total: worthItCount, positive: worthItPositive },
    insights,
    expenses: monthExpenses
  };
}
