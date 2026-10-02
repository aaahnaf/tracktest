import { openDB, IDBPDatabase } from 'idb';
import { Expense, Settings, DEFAULT_SETTINGS } from './types';

const DB_NAME = 'what-did-i-spend';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('date', 'date');
        expenseStore.createIndex('category', 'category');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  return dbInstance;
}

// Expenses
export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const expenses = await db.getAll('expenses');
  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', expense);
}

export async function updateExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', { ...expense, updatedAt: new Date().toISOString() });
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('expenses', id);
}

export async function deleteAllExpenses(): Promise<void> {
  const db = await getDB();
  await db.clear('expenses');
}

export async function exportData(): Promise<string> {
  const expenses = await getAllExpenses();
  const settings = await getSettings();
  return JSON.stringify({ expenses, settings, exportedAt: new Date().toISOString() }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  const db = await getDB();
  const tx = db.transaction(['expenses', 'settings'], 'readwrite');
  if (data.expenses) {
    for (const expense of data.expenses) {
      await tx.objectStore('expenses').put(expense);
    }
  }
  if (data.settings) {
    await tx.objectStore('settings').put({ key: 'settings', ...data.settings });
  }
  await tx.done;
}

// Settings
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const result = await db.get('settings', 'settings');
  return result ? { ...DEFAULT_SETTINGS, ...result } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key: 'settings', ...settings });
}
