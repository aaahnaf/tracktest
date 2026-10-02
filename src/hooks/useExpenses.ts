import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../lib/types';
import { getAllExpenses, addExpense as dbAdd, updateExpense as dbUpdate, deleteExpense as dbDelete, deleteAllExpenses as dbDeleteAll } from '../lib/db';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllExpenses();
    setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addExpense = useCallback(async (expense: Expense) => {
    await dbAdd(expense);
    await load();
  }, [load]);

  const updateExpense = useCallback(async (expense: Expense) => {
    await dbUpdate(expense);
    await load();
  }, [load]);

  const deleteExpense = useCallback(async (id: string) => {
    await dbDelete(id);
    await load();
  }, [load]);

  const deleteAll = useCallback(async () => {
    await dbDeleteAll();
    await load();
  }, [load]);

  return { expenses, loading, addExpense, updateExpense, deleteExpense, deleteAll, reload: load };
}
