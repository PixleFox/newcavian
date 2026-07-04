import { toGregorian } from 'jalaali-js';

export const persianToEnglish = (str: string) => str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

export const transformShamsiToGregorian = (shamsiDate: string): string | null => {
  if (!shamsiDate) return null;
  const englishDate = persianToEnglish(shamsiDate);
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(englishDate)) {
    return null;
  }
  const [year, month, day] = englishDate.split('/').map(Number);
  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < 1300 || year > 1500 ||
    month < 1 || month > 12 ||
    day < 1 || day > 31
  ) {
    return null;
  }
  try {
    const { gy, gm, gd } = toGregorian(year, month, day);
    const gregorianDate = new Date(Date.UTC(gy, gm - 1, gd));
    if (isNaN(gregorianDate.getTime())) {
      return null;
    }
    return gregorianDate.toISOString();
  } catch (error) {
    console.error('Date transformation error:', error);
    return null;
  }
};

export const toShamsiDisplay = (gregorianDate: string): string => {
  if (!gregorianDate || gregorianDate === 'Invalid Date') return '';
  const date = new Date(gregorianDate);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fa-IR', { calendar: 'persian' });
};