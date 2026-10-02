import { format, isToday, isYesterday, isThisWeek, isThisYear, differenceInMinutes, differenceInHours, parseISO } from 'date-fns';
import { CURRENCY_SYMBOLS, Currency } from './types';

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function formatSmartDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  if (isThisYear(date)) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
}

export function formatRelativeTime(dateStr: string): string {
  const date = parseISO(dateStr);
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;
  return formatSmartDate(dateStr);
}

export function formatTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'h:mm a');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function groupExpensesByDate<T extends { date: string }>(expenses: T[]): [string, T[]][] {
  const groups: Record<string, T[]> = {};
  expenses.forEach(exp => {
    const key = exp.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(exp);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
}

export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }
  return dates;
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function getInsights(expenses: { amount: number; date: string; category: string }[], currency: Currency): string[] {
  if (expenses.length === 0) return [];
  
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const lastMonth = expenses.filter(e => {
    const d = parseISO(e.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const insights: string[] = [];

  if (thisMonth.length > 0) {
    // Category insight
    const catTotals: Record<string, number> = {};
    thisMonth.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    const topCat = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0];
    if (topCat) {
      const catName = topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1);
      insights.push(`You spent the most on ${catName} this month.`);
    }

    // Comparison
    const thisTotal = thisMonth.reduce((s, e) => s + e.amount, 0);
    const lastTotal = lastMonth.reduce((s, e) => s + e.amount, 0);
    if (lastTotal > 0) {
      const diff = Math.abs(thisTotal - lastTotal);
      const pct = Math.round((diff / lastTotal) * 100);
      if (thisTotal < lastTotal) {
        insights.push(`Your spending is ${pct}% lower than last month.`);
      } else if (thisTotal > lastTotal) {
        insights.push(`Your spending is ${pct}% higher than last month.`);
      }
    }

    // Daily average
    const daysInMonth = now.getDate();
    const avg = thisTotal / daysInMonth;
    insights.push(`Your average daily spending is ${formatCurrency(avg, currency)}.`);

    // Day of week insight
    const dayTotals: Record<number, number> = {};
    thisMonth.forEach(e => {
      const day = parseISO(e.date).getDay();
      dayTotals[day] = (dayTotals[day] || 0) + e.amount;
    });
    const topDay = Object.entries(dayTotals).sort(([, a], [, b]) => b - a)[0];
    if (topDay) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      insights.push(`${days[parseInt(topDay[0])]} is usually your highest-spending day.`);
    }
  }

  return insights.slice(0, 3);
}
