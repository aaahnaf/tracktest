export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  
  // Memory fields (optional)
  memoryNote?: string; // "What was this for?"
  worthItRating?: 'absolutely' | 'mostly' | 'not-really' | 'no';
  futureMeNote?: string; // "Anything you want to remember?"
  futureMeReminderDate?: string; // ISO date
  merchant?: string; // Store/vendor name
  productName?: string; // Specific product
  episodeId?: string; // Link to spending episode
  attachments?: Attachment[]; // Receipts, photos
}

export interface Attachment {
  id: string;
  type: 'image' | 'receipt' | 'other';
  data: string; // Base64 encoded
  name: string;
  createdAt: string;
}

export interface SpendingEpisode {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export type WorthItRating = 'absolutely' | 'mostly' | 'not-really' | 'no';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Theme = 'light' | 'dark' | 'system';
export type Currency = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'BDT' | 'PKR' | 'LKR' | 'NPR'
  | 'AUD' | 'CAD' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'NZD' | 'SGD' | 'HKD' | 'KRW'
  | 'MXN' | 'BRL' | 'ZAR' | 'RUB' | 'TRY' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD'
  | 'OMR' | 'JOD' | 'EGP' | 'NGN' | 'KES' | 'GHS' | 'TZS' | 'UGX' | 'MAD' | 'TND'
  | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'RSD' | 'UAH' | 'BYN' | 'GEL'
  | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND' | 'MMK' | 'KHR' | 'LAK' | 'BND' | 'TWD'
  | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'PYG' | 'BOB' | 'CRC' | 'PAB' | 'DOP'
  | 'ILS' | 'IRR' | 'IQD' | 'LBP' | 'SYP' | 'YER' | 'AFN' | 'KZT' | 'UZS' | 'TJS'
  | 'MNT' | 'ISK' | 'BAM' | 'MKD' | 'ALL' | 'AMD' | 'AZN' | 'MDL' | 'KGS' | 'TMT';

export type Page = 'overview' | 'transactions' | 'memory' | 'analytics' | 'replay' | 'settings';

export interface Settings {
  theme: Theme;
  currency: Currency;
  defaultCategory: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', color: '#f97316' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#a855f7' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#ec4899' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10b981' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹', BDT: '৳', PKR: '₨', LKR: '₨', NPR: '₨',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', KRW: '₩',
  MXN: 'MX$', BRL: 'R$', ZAR: 'R', RUB: '₽', TRY: '₺', AED: 'د.إ', SAR: '﷼', QAR: '﷼', KWD: 'د.ك', BHD: '.د.ب',
  OMR: '﷼', JOD: 'د.ا', EGP: '£', NGN: '₦', KES: 'KSh', GHS: '₵', TZS: 'TSh', UGX: 'USh', MAD: 'د.م.', TND: 'د.ت',
  PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв', HRK: 'kn', RSD: 'дин.', UAH: '₴', BYN: 'Br', GEL: '₾',
  THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱', VND: '₫', MMK: 'K', KHR: '៛', LAK: '₭', BND: 'B$', TWD: 'NT$',
  ARS: '$', CLP: '$', COP: '$', PEN: 'S/.', UYU: '$U', PYG: '₲', BOB: 'Bs.', CRC: '₡', PAB: 'B/.', DOP: 'RD$',
  ILS: '₪', IRR: '﷼', IQD: 'ع.د', LBP: 'ل.ل', SYP: '£', YER: '﷼', AFN: '؋', KZT: '₸', UZS: 'лв', TJS: 'ЅМ',
  MNT: '₮', ISK: 'kr', BAM: 'KM', MKD: 'ден', ALL: 'L', AMD: '֏', AZN: '₼', MDL: 'L', KGS: 'лв', TMT: 'T',
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  currency: 'BDT',
  defaultCategory: 'food',
};
