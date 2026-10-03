import { Currency, CURRENCY_SYMBOLS } from '../lib/types';

export const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  
  // South Asia
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  
  // Oceania
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  
  // North America
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  
  // Europe
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
  { code: 'BAM', name: 'Bosnia Convertible Mark', symbol: 'KM' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  
  // Asia
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£' },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
  
  // Africa
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
  
  // Eastern Europe & Central Asia
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'лв' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'лв' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
  
  // South America
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
  
  // Central America & Caribbean
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
];

export function getCurrencyName(code: Currency): string {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.name || code;
}

export function getCurrencySymbol(code: Currency): string {
  return CURRENCY_SYMBOLS[code] || code;
}
