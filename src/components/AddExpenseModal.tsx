import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, DEFAULT_CATEGORIES, Currency } from '../lib/types';
import { generateId } from '../lib/utils';
import { CloseIcon, CheckIcon, PlusIcon } from './Icons';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { haptic } from '../lib/haptic';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onUpdate?: (expense: Expense) => void;
  editExpense?: Expense | null;
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

export function AddExpenseModal({ isOpen, onClose, onSave, onUpdate, editExpense, currency }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  useEffect(() => {
    if (isOpen) {
      if (editExpense) {
        setAmount(editExpense.amount.toString());
        setCategory(editExpense.category);
        setNote(editExpense.note);
        setDate(editExpense.date);
      } else {
        setAmount('');
        setCategory('food');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setSaved(false);
      setTimeout(() => amountRef.current?.focus(), 150);
    }
  }, [isOpen, editExpense]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const expense: Expense = {
      id: editExpense?.id || generateId(),
      amount: numAmount,
      currency,
      category,
      note,
      date,
      createdAt: editExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSaved(true);
    haptic('success');
    setTimeout(() => {
      if (editExpense && onUpdate) {
        onUpdate(expense);
      } else {
        onSave(expense);
      }
      onClose();
    }, 400);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-md bg-[var(--bg)] sm:rounded-3xl rounded-t-3xl border border-[var(--border-strong)] max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
                <h2 className="technical-text text-[var(--text-secondary)]">
                  {editExpense ? 'Edit expense' : 'New expense'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Close"
              >
                <CloseIcon size={16} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Amount */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] block mb-3">Amount</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-light text-[var(--text-tertiary)]">
                    {symbol}
                  </span>
                  <input
                    ref={amountRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 text-4xl font-light bg-transparent border-b-2 border-[var(--border-strong)] focus:outline-none focus:border-[var(--text-primary)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] large-number"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] block mb-3">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_CATEGORIES.map(cat => {
                    const Icon = categoryIcons[cat.id] || OtherIcon;
                    const isSelected = category === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCategory(cat.id); haptic('light'); }}
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                            : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <Icon size={18} className={isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'} />
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                          {cat.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] block mb-3">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note…"
                  className="w-full px-4 py-3 bg-transparent border-b border-[var(--border)] focus:outline-none focus:border-[var(--text-primary)] transition-all text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] block mb-3">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border-b border-[var(--border)] focus:outline-none focus:border-[var(--text-primary)] transition-all text-sm text-[var(--text-primary)]"
                />
              </div>

              {/* Save Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-600 text-white'
                    : !amount || parseFloat(amount) <= 0
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                    : 'bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90'
                }`}
              >
                {saved ? (
                  <>
                    <CheckIcon size={16} />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <PlusIcon size={16} />
                    <span>{editExpense ? 'Update expense' : 'Save expense'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
