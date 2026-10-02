import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Expense, DEFAULT_CATEGORIES, Currency } from '../lib/types';
import { generateId } from '../lib/utils';
import { formatCurrency } from '../lib/utils';
import { haptic } from '../lib/haptic';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onUpdate?: (expense: Expense) => void;
  editExpense?: Expense | null;
  currency: Currency;
}

export function AddExpenseModal({ isOpen, onClose, onSave, onUpdate, editExpense, currency }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => amountRef.current?.focus(), 100);
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
    }, 300);
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-md bg-[var(--card)] sm:rounded-2xl rounded-t-2xl border border-[var(--border)] shadow-xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {editExpense ? 'Edit expense' : 'New expense'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-[var(--text-tertiary)]">
                    {currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'}
                  </span>
                  <input
                    ref={amountRef}
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 text-3xl font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-xs font-medium ${
                        category === cat.id
                          ? 'border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                          : 'border-[var(--border)] hover:border-[var(--text-tertiary)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="text-lg">
                        {cat.id === 'food' && '🍔'}
                        {cat.id === 'transport' && '🚕'}
                        {cat.id === 'shopping' && '🛍️'}
                        {cat.id === 'bills' && '📄'}
                        {cat.id === 'entertainment' && '🎮'}
                        {cat.id === 'health' && '💊'}
                        {cat.id === 'education' && '📚'}
                        {cat.id === 'other' && '•••'}
                      </span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note…"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)]"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-600 text-white'
                    : !amount || parseFloat(amount) <= 0
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                    : 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 active:scale-[0.98]'
                }`}
              >
                {saved ? (
                  <>
                    <Check size={18} />
                    Saved
                  </>
                ) : (
                  editExpense ? 'Update expense' : 'Save expense'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
