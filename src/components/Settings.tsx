import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsType, Theme, Currency, CURRENCY_SYMBOLS } from '../lib/types';
import { DownloadIcon, UploadIcon, TrashIcon, ShieldIcon } from './Icons';
import { exportData, importData, deleteAllExpenses } from '../lib/db';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onDeleteAll: () => void;
}

export function Settings({ settings, onUpdateSettings, onDeleteAll }: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  const currencies: { value: Currency; label: string }[] = [
    { value: 'BDT', label: `BDT ${CURRENCY_SYMBOLS.BDT}` },
    { value: 'USD', label: `USD ${CURRENCY_SYMBOLS.USD}` },
    { value: 'EUR', label: `EUR ${CURRENCY_SYMBOLS.EUR}` },
    { value: 'GBP', label: `GBP ${CURRENCY_SYMBOLS.GBP}` },
    { value: 'INR', label: `INR ${CURRENCY_SYMBOLS.INR}` },
  ];

  return (
    <div className="animate-fade-in space-y-10 max-w-lg">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {currencies.map(c => (
            <motion.button
              key={c.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdateSettings({ currency: c.value })}
              className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                settings.currency === c.value
                  ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
              }`}
            >
              {c.label}
            </motion.button>
          ))}
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
    </div>
  );
}
