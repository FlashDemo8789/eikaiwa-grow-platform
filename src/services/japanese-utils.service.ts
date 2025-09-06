import { format, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import * as japaneseHolidays from 'japanese-holidays';

export interface JapaneseName {
  kanji: string;
  hiragana: string;
  katakana?: string;
  romaji?: string;
}

export interface JapaneseAddress {
  zipCode: string;
  prefecture: string;
  city: string;
  town: string;
  building?: string;
  apartment?: string;
}

export interface JapanesePhoneNumber {
  formatted: string;
  countryCode: string;
  areaCode: string;
  localNumber: string;
}

// Japanese prefectures
export const JAPANESE_PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// Japanese school years (April start)
export const JAPANESE_SCHOOL_GRADES = {
  '年少': 3,      // Nursery (3 years old)
  '年中': 4,      // Kindergarten junior
  '年長': 5,      // Kindergarten senior
  '小1': 6,       // Elementary 1st grade
  '小2': 7,       // Elementary 2nd grade
  '小3': 8,       // Elementary 3rd grade
  '小4': 9,       // Elementary 4th grade
  '小5': 10,      // Elementary 5th grade
  '小6': 11,      // Elementary 6th grade
  '中1': 12,      // Junior High 1st grade
  '中2': 13,      // Junior High 2nd grade
  '中3': 14,      // Junior High 3rd grade
  '高1': 15,      // Senior High 1st grade
  '高2': 16,      // Senior High 2nd grade
  '高3': 17,      // Senior High 3rd grade
  '成人': 18      // Adult
};

export class JapaneseUtilsService {
  private readonly JST_TIMEZONE = 'Asia/Tokyo';

  // Convert date to Japanese format
  formatJapaneseDate(date: Date | string, includeWeekday: boolean = true): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    
    const year = jstDate.getFullYear();
    const month = jstDate.getMonth() + 1;
    const day = jstDate.getDate();
    
    let formatted = `${year}年${month}月${day}日`;
    
    if (includeWeekday) {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekday = weekdays[jstDate.getDay()];
      formatted += `（${weekday}）`;
    }
    
    return formatted;
  }

  // Convert time to Japanese format
  formatJapaneseTime(date: Date | string, use24Hour: boolean = true): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    
    if (use24Hour) {
      const hours = jstDate.getHours().toString().padStart(2, '0');
      const minutes = jstDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      let hours = jstDate.getHours();
      const minutes = jstDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? '午後' : '午前';
      hours = hours % 12 || 12;
      return `${ampm}${hours}:${minutes}`;
    }
  }

  // Get current Japanese academic year
  getCurrentAcademicYear(): number {
    const now = new Date();
    const jstNow = toZonedTime(now, this.JST_TIMEZONE);
    const year = jstNow.getFullYear();
    const month = jstNow.getMonth() + 1;
    
    // Academic year starts in April
    return month >= 4 ? year : year - 1;
  }

  // Get Japanese academic year for a given date
  getAcademicYearForDate(date: Date | string): number {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const year = jstDate.getFullYear();
    const month = jstDate.getMonth() + 1;
    
    return month >= 4 ? year : year - 1;
  }

  // Get semester for Japanese school year
  getCurrentSemester(): '1学期' | '2学期' | '3学期' {
    const now = new Date();
    const jstNow = toZonedTime(now, this.JST_TIMEZONE);
    const month = jstNow.getMonth() + 1;
    
    if (month >= 4 && month <= 7) return '1学期';
    if (month >= 9 && month <= 12) return '2学期';
    return '3学期';
  }

  // Validate Japanese phone number
  validateJapanesePhone(phone: string): boolean {
    // Remove all spaces and hyphens
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Japanese phone number patterns
    const patterns = [
      /^0[1-9]\d{8,9}$/, // Standard landline (10-11 digits starting with 0)
      /^0[789]0\d{8}$/,  // Mobile (11 digits starting with 070, 080, 090)
      /^050\d{8}$/,      // IP phone (11 digits starting with 050)
      /^0120\d{6}$/,     // Toll-free (10 digits starting with 0120)
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  // Format Japanese phone number
  formatJapanesePhone(phone: string): string {
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Mobile numbers (090, 080, 070)
    if (/^0[789]0\d{8}$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    // Landline numbers (10 digits)
    if (/^0[1-9]\d{8}$/.test(cleaned)) {
      // Tokyo area (03)
      if (cleaned.startsWith('03')) {
        return `03-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      // Osaka area (06)
      if (cleaned.startsWith('06')) {
        return `06-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      // Other areas (4-digit area code)
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
    }
    
    // Landline numbers (11 digits)
    if (/^0[1-9]\d{9}$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // IP phone (050)
    if (/^050\d{8}$/.test(cleaned)) {
      return `050-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    // Toll-free (0120)
    if (/^0120\d{6}$/.test(cleaned)) {
      return `0120-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if no pattern matches
  }

  // Validate Japanese zip code
  validateJapaneseZipCode(zipCode: string): boolean {
    const cleaned = zipCode.replace(/[\s-]/g, '');
    return /^\d{7}$/.test(cleaned);
  }

  // Format Japanese zip code
  formatJapaneseZipCode(zipCode: string): string {
    const cleaned = zipCode.replace(/[\s-]/g, '');
    if (this.validateJapaneseZipCode(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return zipCode;
  }

  // Check if date is a Japanese national holiday
  isJapaneseHoliday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    
    return japaneseHolidays.isHoliday(jstDate);
  }

  // Get Japanese holiday name
  getJapaneseHolidayName(date: Date | string): string | null {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    
    const holiday = japaneseHolidays.getHolidaysOfYear(jstDate.getFullYear())
      .find(h => h.date.getTime() === jstDate.getTime());
    
    return holiday ? holiday.name : null;
  }

  // Get all Japanese holidays for a year
  getJapaneseHolidaysForYear(year: number): Array<{date: Date, name: string}> {
    return japaneseHolidays.getHolidaysOfYear(year);
  }

  // Check if name contains kanji
  containsKanji(text: string): boolean {
    return /[\u4e00-\u9faf]/.test(text);
  }

  // Check if name contains hiragana
  containsHiragana(text: string): boolean {
    return /[\u3040-\u309f]/.test(text);
  }

  // Check if name contains katakana
  containsKatakana(text: string): boolean {
    return /[\u30a0-\u30ff]/.test(text);
  }

  // Convert katakana to hiragana
  katakanaToHiragana(text: string): string {
    return text.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  // Convert hiragana to katakana
  hiraganaToKatakana(text: string): string {
    return text.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  }

  // Check if current time is Japanese business hours
  isJapaneseBusinessHours(): boolean {
    const now = new Date();
    const jstNow = toZonedTime(now, this.JST_TIMEZONE);
    const hour = jstNow.getHours();
    const dayOfWeek = jstNow.getDay();
    
    // Monday to Friday, 9:00-18:00 JST
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 18;
  }

  // Get age in Japanese school system
  getJapaneseSchoolAge(birthDate: Date | string): number {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    const jstBirth = toZonedTime(birth, this.JST_TIMEZONE);
    const now = new Date();
    const jstNow = toZonedTime(now, this.JST_TIMEZONE);
    
    let age = jstNow.getFullYear() - jstBirth.getFullYear();
    
    // Adjust for Japanese school year (April start)
    const currentMonth = jstNow.getMonth() + 1;
    const currentDay = jstNow.getDate();
    const birthMonth = jstBirth.getMonth() + 1;
    const birthDay = jstBirth.getDate();
    
    if (currentMonth < 4 || (currentMonth === 4 && currentDay < 1)) {
      // Before April 1st, use previous year's calculation
      if (birthMonth < 4 || (birthMonth === 4 && birthDay <= 1)) {
        age--;
      }
    } else {
      // After April 1st, standard calculation
      if (birthMonth > currentMonth || (birthMonth === currentMonth && birthDay > currentDay)) {
        age--;
      }
    }
    
    return age;
  }

  // Get grade for Japanese school age
  getJapaneseGrade(birthDate: Date | string): string {
    const age = this.getJapaneseSchoolAge(birthDate);
    
    const gradeMap: { [key: number]: string } = {
      3: '年少',
      4: '年中',
      5: '年長',
      6: '小1',
      7: '小2',
      8: '小3',
      9: '小4',
      10: '小5',
      11: '小6',
      12: '中1',
      13: '中2',
      14: '中3',
      15: '高1',
      16: '高2',
      17: '高3'
    };
    
    return gradeMap[age] || (age >= 18 ? '成人' : '未就学');
  }

  // Format Japanese currency
  formatJapaneseCurrency(amount: number): string {
    return `¥${amount.toLocaleString('ja-JP')}`;
  }

  // Get Japanese era for date
  getJapaneseEra(date: Date | string): { era: string; year: number } {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const year = jstDate.getFullYear();
    
    if (year >= 2019) {
      return { era: '令和', year: year - 2018 };
    } else if (year >= 1989) {
      return { era: '平成', year: year - 1988 };
    } else if (year >= 1926) {
      return { era: '昭和', year: year - 1925 };
    } else if (year >= 1912) {
      return { era: '大正', year: year - 1911 };
    } else {
      return { era: '明治', year: year - 1867 };
    }
  }

  // Format date with Japanese era
  formatJapaneseEraDate(date: Date | string): string {
    const { era, year } = this.getJapaneseEra(date);
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const month = jstDate.getMonth() + 1;
    const day = jstDate.getDate();
    
    return `${era}${year}年${month}月${day}日`;
  }

  // Check if date is within Japanese Golden Week
  isGoldenWeek(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const month = jstDate.getMonth() + 1;
    const day = jstDate.getDate();
    
    // Golden Week is typically late April to early May
    return (month === 4 && day >= 29) || (month === 5 && day <= 5);
  }

  // Check if date is within Japanese Obon period
  isObonPeriod(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const month = jstDate.getMonth() + 1;
    const day = jstDate.getDate();
    
    // Obon is typically August 13-16
    return month === 8 && day >= 13 && day <= 16;
  }

  // Get season based on Japanese calendar
  getJapaneseSeason(date?: Date | string): 'spring' | 'summer' | 'autumn' | 'winter' {
    const dateObj = date ? (typeof date === 'string' ? parseISO(date) : date) : new Date();
    const jstDate = toZonedTime(dateObj, this.JST_TIMEZONE);
    const month = jstDate.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}

export const japaneseUtils = new JapaneseUtilsService();