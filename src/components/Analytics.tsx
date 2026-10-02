import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, getMonthStart, getMonthEnd, getWeekDates, getInsights } from '../lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { parseISO, format } from 'date-fns';

interface AnalyticsProps {
  expenses: Expense[];
  currency: Currency;
}

const categoryIcons: Record<string, any> = {
  food: FoodIcon,
  transport: TransportIcon,
  shopping: ShoppingIcon,
  bills: BillsIcon,
  entertainment: EntertainmentIcon,
  health: HealthIcon,
  education: EducationIcon,
  other: OtherIcon,
};

// Monochrome palette with subtle variations
const categoryColors = [
  '#000000', // Pure black
  '#404040', // Dark gray
  '#666666', // Medium gray
  '#8c8c8c', // Light gray
  '#b3b3b3', // Lighter gray
  '#d9d9d9', // Very light gray
  '#f0f0f0', // Almost white
  '#a3a3a3', // Neutral gray
];

export function Analytics({ expenses, currency }: AnalyticsProps) {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);

  const thisMonthExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = parseISO(e.date);
      return d >= monthStart && d <= monthEnd;
    }), [expenses, monthStart, monthEnd]);

  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  // Weekly data
  const weekDates = getWeekDates();
  const weeklyData = useMemo(() => {
    return weekDates.map(date => {
      const dayExpenses = expenses.filter(e => e.date === date);
      const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
      return { date, total, label: format(parseISO(date), 'EEE') };
    });
  }, [expenses, weekDates]);

  const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([id, amount], index) => ({
        id,
        amount,
        percentage: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
        category: DEFAULT_CATEGORIES.find(c => c.id === id),
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses, thisMonthTotal]);

  const insights = getInsights(expenses, currency);

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center animate-fade-in">
        <p className="text-sm text-[var(--text-secondary)]">No data to analyze yet.</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Start tracking expenses to see insights.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-12">
      {/* Monthly Total */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
        <div className="pl-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="technical-text text-[var(--text-secondary)]">This month</span>
          </div>
          <AnimatedNumber
            value={thisMonthTotal}
            prefix={`${symbol} `}
            className="text-5xl sm:text-6xl font-light tracking-tight text-[var(--text-primary)] large-number"
          />
          <p className="text-sm text-[var(--text-secondary)] mt-2">total spending</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
          <h3 className="technical-text text-[var(--text-secondary)]">Last 7 days</h3>
        </div>
        <div className="relative">
          {/* Grid background */}
          <div className="absolute inset-0 grid-lines rounded-xl" />
          
          <div className="relative flex items-end gap-2 h-40 border-b border-[var(--border)] pb-2">
            {weeklyData.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.total / maxWeekly) * 100}%` }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    className="w-full rounded-t-sm min-h-[2px]"
                    style={{ 
                      backgroundColor: day.total > 0 ? 'var(--text-primary)' : 'var(--border)',
                      opacity: day.total > 0 ? 0.9 : 0.3
                    }}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: day.total > 0 ? 0.9 : 0.3 }}
                    transition={{ delay: i * 0.06 + 0.3 }}
                  />
                </div>
                <span className="technical-text text-[var(--text-tertiary)]">{day.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
          <h3 className="technical-text text-[var(--text-secondary)]">By category</h3>
        </div>
        
        {/* Visual indicator */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {categoryBreakdown.reduce<{ elements: JSX.Element[]; offset: number }>((acc, item, i) => {
                const dashArray = `${item.percentage} ${100 - item.percentage}`;
                acc.elements.push(
                  <motion.circle
                    key={item.id}
                    cx="18" cy="18" r="15.915"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="3"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-acc.offset}
                    initial={{ opacity: 0, strokeWidth: 0 }}
                    animate={{ opacity: 1, strokeWidth: 3 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                );
                acc.offset += item.percentage;
                return acc;
              }, { elements: [], offset: 0 }).elements}
            </svg>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {categoryBreakdown.slice(0, 5).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[var(--text-primary)] flex-1">{item.category?.name}</span>
                <span className="text-sm text-[var(--text-tertiary)] large-number">{item.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed list */}
        <div className="space-y-2">
          {categoryBreakdown.map((item, i) => {
            const Icon = categoryIcons[item.id] || OtherIcon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-xl hover:border-[var(--border-strong)] transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.category?.name}</p>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] large-number">{formatCurrency(item.amount, currency)}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.percentage}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <h3 className="technical-text text-[var(--text-secondary)]">Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-start gap-3 p-4 border border-[var(--border)] rounded-xl hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
