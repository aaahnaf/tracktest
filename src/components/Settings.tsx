import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Shield } from 'lucide-react';
import { Settings as SettingsType, Theme, Currency, CURRENCY_SYMBOLS } from '../lib/types';
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

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'BDT', label: `BDT ${CURRENCY_SYMBOLS.BDT}` },
    { value: 'USD', label: `USD ${CURRENCY_SYMBOLS.USD}` },
    { value: 'EUR', label: `EUR ${CURRENCY_SYMBOLS.EUR}` },
    { value: 'GBP', label: `GBP ${CURRENCY_SYMBOLS.GBP}` },
    { value: 'INR', label: `INR ${CURRENCY_SYMBOLS.INR}` },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-lg">
      {/* Appearance */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Appearance</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => onUpdateSettings({ theme: t.value })}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                  settings.theme === t.value
                    ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                    : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                <Icon size={18} className="text-[var(--text-secondary)]" />
                <span className="text-xs font-medium text-[var(--text-primary)]">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Currency</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {currencies.map(c => (
            <button
              key={c.value}
              onClick={() => onUpdateSettings({ currency: c.value })}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                settings.currency === c.value
                  ? 'border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Data</h3>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-all text-left"
          >
            <Download size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Export data</span>
            <span className="text-xs text-[var(--text-tertiary)] ml-auto">JSON</span>
          </button>
          
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--text-tertiary)] transition-all text-left"
          >
            <Upload size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Import data</span>
            {importStatus === 'success' && <span className="text-xs text-green-600 ml-auto">Success!</span>}
            {importStatus === 'error' && <span className="text-xs text-red-500 ml-auto">Error</span>}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
          >
            <Trash2 size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete all data</span>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl"
        >
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            This will permanently delete all your expenses. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete everything
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Privacy */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] rounded-xl">
        <Shield size={16} className="text-[var(--text-tertiary)] shrink-0" />
        <p className="text-xs text-[var(--text-tertiary)]">
          Your data stays on this device. No accounts, no servers, no tracking.
        </p>
      </div>
    </div>
  );
}
