import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsType, Theme, Currency } from '../lib/types';
import { DownloadIcon, UploadIcon, TrashIcon, ShieldIcon, PlusIcon, CloseIcon } from './Icons';
import { exportData, importData, deleteAllExpenses } from '../lib/db';
import { CURRENCIES } from '../lib/currencies';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onDeleteAll: () => void;
}

export function Settings({ settings, onUpdateSettings, onDeleteAll }: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showGuide, setShowGuide] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `what-did-i-spend-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importData(text);
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 2000);
      window.location.reload();
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 2000);
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllExpenses();
    onDeleteAll();
    setShowDeleteConfirm(false);
  };

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const currencies = CURRENCIES.map(c => ({
    value: c.code,
    label: `${c.code} ${c.symbol}`
  }));

  return (
    <div className="animate-fade-in space-y-10 max-w-lg">
      {/* Getting Started Guide */}
      <div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowGuide(true)}
          className="w-full flex items-center gap-4 p-5 border border-[var(--accent)] rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0">
            <span className="text-[var(--bg)] text-lg">?</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">Getting Started</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Learn how to use the app</p>
          </div>
          <span className="text-[var(--text-tertiary)]">→</span>
        </motion.button>
      </div>

      {/* Appearance */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
          <h3 className="technical-text text-[var(--text-secondary)]">Appearance</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => (
            <motion.button
              key={t.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdateSettings({ theme: t.value })}
              className={`flex flex-col items-center gap-3 py-5 rounded-xl border transition-all ${
                settings.theme === t.value
                  ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 ${
                settings.theme === t.value ? 'border-[var(--text-primary)]' : 'border-[var(--border)]'
              }`}>
                {settings.theme === t.value && (
                  <div className="w-full h-full rounded-full bg-[var(--text-primary)]" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                settings.theme === t.value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}>{t.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
          <h3 className="technical-text text-[var(--text-secondary)]">Currency</h3>
        </div>
        <div className="max-h-96 overflow-y-auto border border-[var(--border)] rounded-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
            {currencies.map(c => (
              <motion.button
                key={c.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdateSettings({ currency: c.value })}
                className={`px-4 py-3 text-sm font-medium transition-all border-b border-r border-[var(--border)] ${
                  settings.currency === c.value
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50'
                }`}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Data */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
          <h3 className="technical-text text-[var(--text-secondary)]">Data</h3>
        </div>
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all text-left group"
          >
            <DownloadIcon size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="text-sm font-medium text-[var(--text-primary)] flex-1">Export data</span>
            <span className="technical-text text-[var(--text-tertiary)]">JSON</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all text-left group"
          >
            <UploadIcon size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="text-sm font-medium text-[var(--text-primary)] flex-1">Import data</span>
            {importStatus === 'success' && <span className="technical-text text-green-600">Success</span>}
            {importStatus === 'error' && <span className="technical-text text-red-500">Error</span>}
          </motion.button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left group"
          >
            <TrashIcon size={18} className="text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete all data</span>
          </motion.button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl"
        >
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            This will permanently delete all your expenses. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDeleteAll}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors"
            >
              Delete everything
            </motion.button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Privacy */}
      <div className="flex items-center gap-3 px-5 py-4 border border-[var(--border)] rounded-xl">
        <ShieldIcon size={16} className="text-[var(--text-tertiary)] shrink-0" />
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          Your data stays on this device. No accounts, no servers, no tracking.
        </p>
      </div>

      {/* Getting Started Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-[var(--bg)] rounded-3xl border border-[var(--border-strong)] max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[var(--bg)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <h2 className="technical-text text-[var(--text-secondary)]">Getting Started</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGuide(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <CloseIcon size={16} className="text-[var(--text-secondary)]" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                {/* Intro */}
                <div>
                  <h3 className="text-lg font-light text-[var(--text-primary)] mb-2">Welcome</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    This app helps you track spending and understand your financial patterns. Here's how to get started.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    {
                      num: '01',
                      title: 'Add your first expense',
                      desc: 'Tap the + button. Enter the amount, pick a category, and save. That\'s it.'
                    },
                    {
                      num: '02',
                      title: 'Check your overview',
                      desc: 'The home screen shows your monthly spending at a glance. As you add more expenses, you\'ll see trends and insights.'
                    },
                    {
                      num: '03',
                      title: 'Add memories (optional)',
                      desc: 'When editing an expense, you can add "What was this for?" and rate if it was worth it. These become your spending memories.'
                    },
                    {
                      num: '04',
                      title: 'Explore deeper',
                      desc: 'As your history grows, features like Financial Replay, anomaly detection, and spending DNA become available.'
                    },
                    {
                      num: '05',
                      title: 'Use natural search',
                      desc: 'Try asking questions like "How much did I spend on food last month?" in the Transactions page.'
                    }
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 p-4 border border-[var(--border)] rounded-xl"
                    >
                      <span className="technical-text text-[var(--accent)] shrink-0">{step.num}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{step.title}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Note about data */}
                <div className="p-4 border border-dashed border-[var(--border-strong)] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                    <span className="technical-text text-[var(--text-tertiary)]">About insights</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Advanced features like anomaly detection, spending DNA, and financial replay need some history to work. Keep adding expenses and these will gradually become available. All processing happens on your device — nothing is sent anywhere.
                  </p>
                </div>

                {/* Close button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowGuide(false)}
                  className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg)] rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
