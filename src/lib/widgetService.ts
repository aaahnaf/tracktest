/**
 * Widget Data Service
 * 
 * This service provides an interface to communicate with Android home screen widgets
 * via Capacitor plugins. It allows the web app to update widget data and read
 * pending actions from widgets.
 */

interface WidgetDataPlugin {
  updateMonthlyTotal(options: { total: string; subtitle: string }): Promise<{ success: boolean }>;
  getMonthlyTotal(): Promise<{ total: string; subtitle: string }>;
  getPendingAction(): Promise<{ action: string }>;
}

declare global {
  interface Window {
    WidgetData?: WidgetDataPlugin;
  }
}

/**
 * Update the monthly total displayed on the spending summary widget
 */
export async function updateWidgetMonthlyTotal(total: string, subtitle: string = 'This month'): Promise<void> {
  if (typeof window !== 'undefined' && window.WidgetData) {
    try {
      await window.WidgetData.updateMonthlyTotal({ total, subtitle });
    } catch (error) {
      console.error('Failed to update widget data:', error);
    }
  }
}

/**
 * Get the current monthly total from widget storage
 */
export async function getWidgetMonthlyTotal(): Promise<{ total: string; subtitle: string } | null> {
  if (typeof window !== 'undefined' && window.WidgetData) {
    try {
      return await window.WidgetData.getMonthlyTotal();
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return null;
    }
  }
  return null;
}

/**
 * Check if there's a pending action from a widget tap
 */
export async function getPendingWidgetAction(): Promise<string | null> {
  if (typeof window !== 'undefined' && window.WidgetData) {
    try {
      const result = await window.WidgetData.getPendingAction();
      return result.action || null;
    } catch (error) {
      console.error('Failed to get pending action:', error);
      return null;
    }
  }
  return null;
}

/**
 * Format currency for widget display
 */
export function formatWidgetCurrency(amount: number, currency: string = 'BDT'): string {
  const symbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };
  const symbol = symbols[currency] || '৳';
  return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
