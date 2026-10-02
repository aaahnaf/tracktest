import { openDB, IDBPDatabase } from 'idb';
import { Expense, Settings, DEFAULT_SETTINGS, SpendingEpisode } from './types';

const DB_NAME = 'what-did-i-spend';
const DB_VERSION = 2; // Incremented for migration

let dbInstance: IDBPDatabase | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Version 1: Initial schema
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('category', 'category');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      }
      
      // Version 2: Add episodes store
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('episodes')) {
          const episodeStore = db.createObjectStore('episodes', { keyPath: 'id' });
          episodeStore.createIndex('startDate', 'startDate');
          episodeStore.createIndex('endDate', 'endDate');
        }
      }
      
      // Migration: Existing expenses don't need changes since new fields are optional
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

// Episodes
export async function getAllEpisodes(): Promise<SpendingEpisode[]> {
  const db = await getDB();
  return await db.getAll('episodes');
}

export async function addEpisode(episode: SpendingEpisode): Promise<void> {
  const db = await getDB();
  await db.put('episodes', episode);
}

export async function updateEpisode(episode: SpendingEpisode): Promise<void> {
  const db = await getDB();
  await db.put('episodes', episode);
}

export async function deleteEpisode(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('episodes', id);
}

// Update export to include episodes
export async function exportData(): Promise<string> {
  const expenses = await getAllExpenses();
  const settings = await getSettings();
  const episodes = await getAllEpisodes();
  return JSON.stringify({ 
    expenses, 
    settings, 
    episodes,
    exportedAt: new Date().toISOString(),
    version: 2
  }, null, 2);
}

// Update import to handle episodes
export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  const db = await getDB();
  const tx = db.transaction(['expenses', 'settings', 'episodes'], 'readwrite');
  
  if (data.expenses) {
    for (const expense of data.expenses) {
      await tx.objectStore('expenses').put(expense);
    }
  }
  if (data.settings) {
    await tx.objectStore('settings').put({ key: 'settings', ...data.settings });
  }
  if (data.episodes) {
    for (const episode of data.episodes) {
      await tx.objectStore('episodes').put(episode);
    }
  }
  await tx.done;
}
