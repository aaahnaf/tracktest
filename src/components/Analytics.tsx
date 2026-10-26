import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { GlassCard, TechLabel, staggerParent, riseChild } from './GlassUI';
import { AnimatedNumber } from './AnimatedNumber';
import { setBars3D } from '../three/scene';

interface AnalyticsProps {
  expenses: Expense[];
  currency: Currency;
}

export function Analytics({ expenses, currency }: AnalyticsProps) {
  const data = useMemo(() => {
    // last 8 months spending
    const months: { key: string; label: string; total: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      months.push({ key, label: d.toLocaleString('en', { month: 'short' }), total });
    }
    const maxMonth = Math.max(...months.map((m) => m.total), 1);

    // category breakdown (all time)
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const catTotal = Object.values(byCategory).reduce((s, v) => s + v, 0) || 1;
    const categories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([id, amount]) => ({
        id,
        amount,
        name: DEFAULT_CATEGORIES.find((c) => c.id === id)?.name || id,
        pct: amount / catTotal,
      }));

    return { months, maxMonth, categories };
  }, [expenses]);

  // feed the Three.js carousel sculpture
  useEffect(() => {
    setBars3D(data.months.map((m) => m.total / data.maxMonth));
    return () => setBars3D([]);
  }, [data]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 glass-card !rounded-full flex items-center justify-center mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-slow" />
        </motion.div>
        <p className="text-sm text-[var(--text-secondary)]">Add some expenses to unlock analytics.</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerParent} className="space-y-5">
      {/* hero — big animated number */}
      <motion.div variants={riseChild}>
        <GlassCard tilt={false} className="p-6 sm:p-8">
          <div className="relative z-[3]">
            <TechLabel accent>All-time spending</TechLabel>
            <AnimatedNumber
              value={data.categories.reduce((s, c) => s + c.amount, 0)}
              className="text-5xl sm:text-6xl font-light tracking-tight large-number mt-4 block number-glow"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              across {data.categories.length} {data.categories.length === 1 ? 'category' : 'categories'} · rendered in 3D below ↓
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* instruction strip for the 3D scene */}
      <motion.div variants={riseChild}>
        <div className="glass-pill w-full !py-3 text-center cursor-default">
          <span className="technical-text">Monthly volume orbiting in real 3D — watch it rotate</span>
        </div>
      </motion.div>

      {/* monthly bars (DOM mirror of the 3D sculpture) */}
      <motion.div variants={riseChild}>
        <GlassCard tilt={false} className="p-6">
          <div className="relative z-[3]">
            <TechLabel>Last 8 months</TechLabel>
            <div className="flex items-end gap-2 sm:gap-3 h-40 mt-6">
              {data.months.map((m, i) => (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full relative flex-1 flex items-end">
                    <motion.div
                      className="w-full rounded-t-md rounded-b-sm"
                      style={{
                        background: i % 4 === 3
                          ? 'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08))'
                          : 'var(--text-primary)',
                        opacity: i % 4 === 3 ? 1 : 0.85,
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max((m.total / data.maxMonth) * 100, 2)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="technical-text text-[var(--text-tertiary)]">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* category breakdown */}
      <motion.div variants={riseChild}>
        <GlassCard tilt={false} className="p-6">
          <div className="relative z-[3] space-y-5">
            <TechLabel>Where it went</TechLabel>
            {data.categories.map((cat, i) => (
              <div key={cat.id} className="group">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                  <span className="text-xs tabular-nums text-[var(--text-secondary)]">
                    {formatCurrency(cat.amount, currency)} · {(cat.pct * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[var(--glass-bg-strong)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[var(--text-primary)] group-hover:bg-[var(--accent)] transition-colors"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${cat.pct * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
