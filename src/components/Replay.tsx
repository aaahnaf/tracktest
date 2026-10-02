import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

interface ReplayProps {
  expenses: Expense[];
  currency: Currency;
}

type Period = 'week' | 'month' | 'year';

export function Replay({ expenses, currency }: ReplayProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const selected = parseISO(selectedDate);
    
    if (period === 'week') {
      return {
        start: startOfWeek(selected, { weekStartsOn: 1 }),
        end: endOfWeek(selected, { weekStartsOn: 1 }),
        days: eachDayOfInterval({
          start: startOfWeek(selected, { weekStartsOn: 1 }),
          end: endOfWeek(selected, { weekStartsOn: 1 })
        })
      };
    } else if (period === 'month') {
      return {
        start: startOfMonth(selected),
        end: endOfMonth(selected),
        days: eachDayOfInterval({
          start: startOfMonth(selected),
          end: endOfMonth(selected)
        })
      };
    } else {
      return {
        start: startOfYear(selected),
        end: endOfYear(selected),
        days: eachDayOfInterval({
          start: startOfYear(selected),
          end: endOfYear(selected)
        })
      };
    }
  }, [selectedDate, period]);

  // Calculate cumulative spending
  const cumulativeData = useMemo(() => {
    const cumulative: { date: string; amount: number; count: number }[] = [];
    let runningTotal = 0;
    let runningCount = 0;

    dateRange.days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
      
      runningTotal += dayTotal;
      runningCount += dayExpenses.length;
      
      cumulative.push({
        date: dateStr,
        amount: runningTotal,
        count: runningCount
      });
    });

    return cumulative;
  }, [expenses, dateRange]);

  // Find current position in timeline
  const currentIndex = cumulativeData.findIndex(d => d.date >= selectedDate);
  const currentData = currentIndex >= 0 ? cumulativeData[currentIndex] : cumulativeData[cumulativeData.length - 1];

  const maxAmount = Math.max(...cumulativeData.map(d => d.amount), 1);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
        <div className="relative mb-12">
          <div className="w-32 h-32 border border-[var(--border)] rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-[var(--border)] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse-slow" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">No spending to replay</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed">
          Start tracking expenses to see your spending replay.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(['week', 'month', 'year'] as const).map(p => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-xs rounded-full border transition-all capitalize ${
              period === p
                ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                : 'border-[var(--border)] text-[var(--text-secondary)]'
            }`}
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Main display */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
        <div className="pl-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="technical-text text-[var(--text-secondary)]">
              {period === 'week' && 'This week'}
              {period === 'month' && 'This month'}
              {period === 'year' && 'This year'}
            </span>
          </div>
          
          <AnimatedNumber
            value={currentData?.amount || 0}
            prefix={`${symbol} `}
            className="text-5xl sm:text-6xl font-light tracking-tight text-[var(--text-primary)] large-number"
          />
          
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {currentData?.count || 0} {currentData?.count === 1 ? 'purchase' : 'purchases'}
          </p>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="relative">
        <div className="h-32 border-b border-[var(--border)] relative">
          {/* Grid background */}
          <div className="absolute inset-0 grid-lines opacity-20" />
          
          {/* Cumulative line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <motion.path
              d={cumulativeData.map((d, i) => {
                const x = (i / (cumulativeData.length - 1)) * 100;
                const y = 100 - (d.amount / maxAmount) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          </svg>

          {/* Current position indicator */}
          {currentIndex >= 0 && (
            <motion.div
              className="absolute top-0 bottom-0 w-px bg-[var(--accent)]"
              initial={{ left: 0 }}
              animate={{ left: `${(currentIndex / (cumulativeData.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)]" />
            </motion.div>
          )}
        </div>

        {/* Timeline scrubber */}
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max={cumulativeData.length - 1}
            value={currentIndex >= 0 ? currentIndex : cumulativeData.length - 1}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              setSelectedDate(cumulativeData[index].date);
            }}
            className="w-full h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[var(--text-tertiary)]">
              {format(dateRange.start, 'MMM d')}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {format(parseISO(selectedDate), 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {format(dateRange.end, 'MMM d')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 border border-[var(--border)] rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)] mb-1 technical-text">Average per day</p>
          <p className="text-lg font-light text-[var(--text-primary)] large-number">
            {formatCurrency(
              cumulativeData.length > 0 ? currentData.amount / (currentIndex + 1) : 0,
              currency
            )}
          </p>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)] mb-1 technical-text">Purchases</p>
          <p className="text-lg font-light text-[var(--text-primary)] large-number">
            {currentData?.count || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
