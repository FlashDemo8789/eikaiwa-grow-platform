import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ja'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: locale === 'ja' ? 'Asia/Tokyo' : 'UTC',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        japanese: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
          era: locale === 'ja' ? 'short' : undefined
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: locale === 'ja' ? 'JPY' : 'USD'
        },
        japanese: {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          useGrouping: true
        }
      }
    }
  };
});