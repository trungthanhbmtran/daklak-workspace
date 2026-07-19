import { isSameDay, parse, startOfDay } from 'date-fns';

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

// Fixed solar holidays (DD/MM)
const fixedSolarHolidays = [
  { day: 1, month: 1, name: 'Tết Dương lịch' },
  { day: 30, month: 4, name: 'Ngày Giải phóng miền Nam' },
  { day: 1, month: 5, name: 'Ngày Quốc tế Lao động' },
  { day: 2, month: 9, name: 'Quốc khánh' },
];

// Lunar holidays converted to solar dates for 2024-2030
const lunarHolidays: PublicHoliday[] = [
  // Giỗ Tổ Hùng Vương (10/3 AL)
  { date: '2024-04-18', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2025-04-07', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2026-04-26', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2027-04-16', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2028-04-04', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2029-04-23', name: 'Giỗ Tổ Hùng Vương' },
  { date: '2030-04-12', name: 'Giỗ Tổ Hùng Vương' },

  // Tết Nguyên Đán (Mùng 1 - Mùng 3)
  { date: '2024-02-10', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2024-02-11', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2024-02-12', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2025-01-29', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2025-01-30', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2025-01-31', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2026-02-17', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2026-02-18', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2026-02-19', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2027-02-06', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2027-02-07', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2027-02-08', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2028-01-26', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2028-01-27', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2028-01-28', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2029-02-13', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2029-02-14', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2029-02-15', name: 'Mùng 3 Tết Âm Lịch' },
  { date: '2030-02-02', name: 'Mùng 1 Tết Âm Lịch' },
  { date: '2030-02-03', name: 'Mùng 2 Tết Âm Lịch' },
  { date: '2030-02-04', name: 'Mùng 3 Tết Âm Lịch' },
];

export function getPublicHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // Add fixed solar holidays for the given year
  fixedSolarHolidays.forEach((h) => {
    holidays.push({
      date: `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`,
      name: h.name,
    });
  });

  // Add lunar holidays that fall in the given year
  const lunarInYear = lunarHolidays.filter((h) => h.date.startsWith(year.toString()));
  holidays.push(...lunarInYear);

  return holidays;
}

export function isHoliday(date: Date): PublicHoliday | undefined {
  const year = date.getFullYear();
  const holidays = getPublicHolidays(year);
  
  const targetDate = startOfDay(date);

  return holidays.find((h) => {
    const hDate = parse(h.date, 'yyyy-MM-dd', new Date());
    return isSameDay(targetDate, hDate);
  });
}
