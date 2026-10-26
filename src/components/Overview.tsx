import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate } from '../lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { GlassCard, TechLabel, InkButton, Magnetic, staggerParent, riseChild } from './GlassUI';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { format } from 'date-fns';

interface OverviewProps {
  expenses: Expense[];
  currency: Currency;
  onAddExpense: () => void;
  onViewAll: () => void;
  onViewAnalytics: () => void;
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

export function Overview({ expenses, currency, onAddExpense, onViewAll, onViewAnalytics }: OverviewProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const lastMonth = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM');

    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
    const lastMonthExpenses = expenses.filter((e) => e.date.startsWith(lastMonth));

    const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);

    const dayOfMonth = now.getDate();
    const dailyAverage = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0;

    const byCategory: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

    return {
      monthTotal,
      lastMonthTotal,
      dailyAverage,
      transactionCount: monthExpenses.length,
      topCategory: topCategory
        ? { id: topCategory[0], amount: topCategory[1], name: DEFAULT_CATEGORIES.find((c) => c.id === topCategory[0])?.name || topCategory[0] }
        : null,
    };
  }, [expenses]);

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [expenses]
  );

  if (expenses.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerParent}
        className="flex flex-col items-center justify-center min-h-[62vh] px-6 text-center"
      >
        <motion.div variants={riseChild} className="relative mb-14">
          {/* concentric liquid rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[var(--border-strong)]"
              style={{ inset: -i * 18 }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.5 - i * 0.12, 0.8 - i * 0.12, 0.5 - i * 0.12] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          ))}
          <div className="w-24 h-24 glass-card !rounded-full flex items-center justify-center animate-floaty">
            <div className="w-3 h-3 rounded-full bg-[var(--accent)] accent-glow animate-pulse-slow" />
          </div>
        </motion.div>

        <motion.h1
          variants={riseChild}
          className="text-3xl sm:text-4xl font-light tracking-tight text-[var(--text-primary)] mb-4"
        >
          Your spending story starts with one purchase
        </motion.h1>
        <motion.p
          variants={riseChild}
          className="text-sm text-[var(--text-secondary)] max-w-[340px] leading-relaxed mb-10"
        >
          Track what you spend, remember why it mattered. No accounts, no servers — just you and your money.
        </motion.p>
        <motion.div variants={riseChild}>
          <Magnetic strength={0.3}>
            <InkButton onClick={onAddExpense} className="px-7 py-3.5 text-sm">
              Add first expense
            </InkButton>
          </Magnetic>
        </motion.div>
      </motion.div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Late night spending';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <motion.div initial="hidden" animate="show" variants={staggerParent} className="space-y-5">
      {/* Hero card — this month */}
      <motion.div variants={riseChild}>
        <GlassCard className="p-6 sm:p-8">
          <div className="relative z-[3]">
            <TechLabel>{greeting}</TechLabel>
            <div className="mt-4">
              <AnimatedNumber
                value={stats.monthTotal}
                prefix={`${currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'} `}
                className="text-5xl sm:text-7xl font-light tracking-tight text-[var(--text-primary)] large-number number-glow"
              />
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-3">
              spent this month · {stats.transactionCount} {stats.transactionCount === 1 ? 'purchase' : 'purchases'}
            </p>

            {/* comparison bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between technical-text text-[var(--text-tertiary)]">
                <span>Last month</span>
                <span>This month</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--glass-bg-strong)] overflow-hidden flex">
                <motion.div
                  className="h-full bg-[var(--text-tertiary)]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((stats.lastMonthTotal / Math.max(stats.monthTotal, stats.lastMonthTotal, 1)) * 100, 100)}%`,
                  }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] tabular-nums">
                <span>{formatCurrency(stats.lastMonthTotal, currency)}</span>
                <span>{formatCurrency(stats.monthTotal, currency)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick stats trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div variants={riseChild}>
          <GlassCard tilt={false} className="p-5">
            <div className="relative z-[3]">
              <TechLabel>Daily average</TechLabel>
              <AnimatedNumber
                value={stats.dailyAverage}
                className="text-2xl font-light text-[var(--text-primary)] large-number mt-3 block"
              />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={riseChild}>
          <GlassCard tilt={false} className="p-5">
            <div className="relative z-[3]">
              <TechLabel>Transactions</TechLabel>
              <AnimatedNumber
                value={stats.transactionCount}
                className="text-2xl font-light text-[var(--text-primary)] large-number mt-3 block"
              />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={riseChild}>
          <GlassCard tilt={false} className="p-5">
            <div className="relative z-[3]">
              <TechLabel>Top category</TechLabel>
              {stats.topCategory ? (
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-9 h-9 rounded-xl glass-pill !p-0 flex items-center justify-center">
                    {(() => {
                      const Icon = categoryIcons[stats.topCategory.id] || OtherIcon;
                      return <Icon size={16} className="text-[var(--text-secondary)]" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{stats.topCategory.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)] tabular-nums">
                      {formatCurrency(stats.topCategory.amount, currency)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] mt-3">—</p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent activity marquee + list */}
      <motion.div variants={riseChild}>
        <GlassCard tilt={false} className="p-6">
          <div className="relative z-[3]">
            <div className="flex items-center justify-between mb-4">
              <TechLabel>Recent activity</TechLabel>
              <button
                onClick={onViewAll}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                View all →
              </button>
            </div>

            {/* ticker strip */}
            <div className="marquee-wrap overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] py-2 mb-5">
              <div className="marquee-track">
                {[0, 1].map((dup) => (
                  <span key={dup} className="inline-flex items-center">
                    {recentExpenses.map((e) => (
                      <span key={`${dup}-${e.id}`} className="technical-text text-[var(--text-tertiary)] mx-6 inline-flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
                        {e.note || DEFAULT_CATEGORIES.find((c) => c.id === e.category)?.name}
                        <span className="text-[var(--text-secondary)]">{formatCurrency(e.amount, currency)}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {recentExpenses.map((expense, index) => {
                const Icon = categoryIcons[expense.category] || OtherIcon;
                const categoryName = DEFAULT_CATEGORIES.find((c) => c.id === expense.category)?.name || expense.category;
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 6 }}
                    onClick={onViewAll}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--glass-bg-strong)] cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl border border-[var(--glass-border)] flex items-center justify-center group-hover:border-[var(--border-strong)] group-hover:scale-105 transition-all shrink-0">
                      <Icon size={16} className="text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{expense.note || categoryName}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{categoryName} · {formatSmartDate(expense.date)}</p>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={riseChild} className="flex gap-3 pt-1">
        <Magnetic strength={0.25} className="flex-1">
          <InkButton onClick={onAddExpense} className="w-full px-6 py-4 text-sm">
            Add expense
          </InkButton>
        </Magnetic>
        <Magnetic strength={0.25} className="flex-1">
          <button
            onClick={onViewAnalytics}
            className="glass-pill w-full !py-4 text-sm font-medium"
          >
            View analytics
          </button>
        </Magnetic>
      </motion.div>
    </motion.div>
  );
}
