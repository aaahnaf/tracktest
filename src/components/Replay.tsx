import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { generateReplayEvents, ReplayEvent } from '../lib/advancedAnalytics';
import { AnimatedNumber } from './AnimatedNumber';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon, PlusIcon, MinusIcon } from './Icons';
import { parseISO, format, startOfMonth, endOfMonth, subMonths, addMonths, isBefore, isAfter, eachDayOfInterval } from 'date-fns';

interface ReplayProps {
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

type Mode = 'replay' | 'timemachine';

export function Replay({ expenses, currency }: ReplayProps) {
  const [mode, setMode] = useState<Mode>('replay');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  // Generate events for the selected month
  const events = useMemo(() => {
    if (expenses.length === 0) return [];
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return generateReplayEvents(expenses, start, end);
  }, [expenses, selectedMonth]);

  const currentEvent = events[currentEventIndex];
  const progress = events.length > 0 ? ((currentEventIndex + 1) / events.length) * 100 : 0;

  // Auto-play
  useEffect(() => {
    if (isPlaying && events.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentEventIndex(prev => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, events.length]);

  // Reset when month changes
  useEffect(() => {
    setCurrentEventIndex(0);
    setIsPlaying(false);
  }, [selectedMonth]);

  const handlePlay = () => {
    if (currentEventIndex >= events.length - 1) {
      setCurrentEventIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    const next = addMonths(selectedMonth, 1);
    if (!isAfter(next, new Date())) {
      setSelectedMonth(next);
    }
  };

  const jumpToEvent = (type: ReplayEvent['type']) => {
    const idx = events.findIndex(e => e.type === type);
    if (idx >= 0) {
      setCurrentEventIndex(idx);
      setIsPlaying(false);
    }
  };

  const anomalyEvents = events.filter(e => e.type === 'anomaly');
  const milestoneEvents = events.filter(e => e.type === 'milestone');
  const velocityEvents = events.filter(e => e.type === 'velocity_change');

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
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">No history to replay</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed">
          Start tracking expenses to experience your financial journey.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="technical-text text-[var(--text-secondary)]">
            {mode === 'replay' ? 'Financial Replay' : 'Money Time Machine'}
          </span>
        </div>
        <h1 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">
          {mode === 'replay' ? 'Watch your spending unfold' : 'Travel through your finances'}
        </h1>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] rounded-full border border-[var(--border)]">
        <button
          onClick={() => setMode('replay')}
          className={`flex-1 px-4 py-2 text-xs rounded-full transition-all ${
            mode === 'replay' ? 'bg-[var(--text-primary)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          Replay
        </button>
        <button
          onClick={() => setMode('timemachine')}
          className={`flex-1 px-4 py-2 text-xs rounded-full transition-all ${
            mode === 'timemachine' ? 'bg-[var(--text-primary)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          Time Machine
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-2xl">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <MinusIcon size={16} />
        </motion.button>
        <div className="text-center">
          <p className="text-lg font-light text-[var(--text-primary)]">
            {format(selectedMonth, 'MMMM yyyy')}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] technical-text">
            {events.length} events
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNextMonth}
          disabled={isAfter(addMonths(selectedMonth, 1), new Date())}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-30"
        >
          <PlusIcon size={16} />
        </motion.button>
      </div>

      {/* Main Display */}
      <div className="relative overflow-hidden p-6 border border-[var(--border)] rounded-3xl bg-[var(--bg-secondary)]">
        {/* Dot matrix background */}
        <div className="absolute inset-0 dot-pattern opacity-10" />
        
        <div className="relative space-y-6">
          {/* Current Balance */}
          <div>
            <p className="technical-text text-[var(--text-tertiary)] mb-2">
              {currentEvent ? format(parseISO(currentEvent.date), 'MMMM d') : 'Start'}
            </p>
            <AnimatedNumber
              value={currentEvent?.balance || 0}
              prefix={`${symbol} `}
              className="text-5xl font-light text-[var(--text-primary)] large-number"
              duration={600}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              {mode === 'replay' ? 'Running balance' : 'Balance at this point'}
            </p>
          </div>

          {/* Current Event */}
          <AnimatePresence mode="wait">
            {currentEvent && (
              <motion.div
                key={currentEventIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--border)]"
              >
                <div className="flex items-start gap-3">
                  {/* Event indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    currentEvent.type === 'transaction' ? 'bg-[var(--text-primary)]' :
                    currentEvent.type === 'anomaly' ? 'bg-red-500' :
                    currentEvent.type === 'milestone' ? 'bg-[var(--accent)]' :
                    'bg-orange-500'
                  }`} />
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {currentEvent.description}
                    </p>
                    {currentEvent.amount && (
                      <p className="text-lg font-light text-[var(--text-primary)] large-number mt-1">
                        −{formatCurrency(currentEvent.amount, currency)}
                      </p>
                    )}
                    {currentEvent.category && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-1 capitalize">
                        {currentEvent.category}
                      </p>
                    )}
                    {currentEvent.type === 'anomaly' && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <span className="text-xs text-red-500 technical-text">Anomaly detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Pause */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            className="flex-1 py-3 bg-[var(--text-primary)] text-[var(--bg)] rounded-full font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-current" />
                  <div className="w-1 h-3 bg-current" />
                </div>
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlusIcon size={14} />
                <span>Play</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setCurrentEventIndex(0); setIsPlaying(false); }}
            className="px-4 py-3 border border-[var(--border)] rounded-full text-sm text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors"
          >
            Reset
          </motion.button>
        </div>

        {/* Timeline Scrubber */}
        <div className="relative">
          <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent)] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(0, events.length - 1)}
            value={currentEventIndex}
            onChange={(e) => {
              setCurrentEventIndex(parseInt(e.target.value));
              setIsPlaying(false);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[var(--text-tertiary)]">Event {currentEventIndex + 1}</span>
            <span className="text-xs text-[var(--text-tertiary)]">{events.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      {(anomalyEvents.length > 0 || milestoneEvents.length > 0 || velocityEvents.length > 0) && (
        <div>
          <p className="technical-text text-[var(--text-tertiary)] mb-3">Jump to</p>
          <div className="flex flex-wrap gap-2">
            {anomalyEvents.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => jumpToEvent('anomaly')}
                className="px-3 py-1.5 text-xs rounded-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Anomaly ({anomalyEvents.length})
              </motion.button>
            )}
            {velocityEvents.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => jumpToEvent('velocity_change')}
                className="px-3 py-1.5 text-xs rounded-full border border-orange-200 dark:border-orange-900/50 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
              >
                Velocity change ({velocityEvents.length})
              </motion.button>
            )}
            {milestoneEvents.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => jumpToEvent('milestone')}
                className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors"
              >
                Milestone ({milestoneEvents.length})
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Time Machine specific info */}
      {mode === 'timemachine' && currentEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-[var(--border)] rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <p className="technical-text text-[var(--text-secondary)]">Time Machine State</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Date</span>
              <span className="text-[var(--text-primary)]">{format(parseISO(currentEvent.date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Balance</span>
              <span className="text-[var(--text-primary)] large-number">{formatCurrency(currentEvent.balance || 0, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Events so far</span>
              <span className="text-[var(--text-primary)]">{currentEventIndex + 1}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
