'use client';

import React, { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { japaneseUtils } from '@/services/japanese-utils.service';
import { SEASONAL_THEMES } from '@/services/line.service';

interface JapaneseLayoutProps {
  children: ReactNode;
  showSeasonalTheme?: boolean;
  density?: 'compact' | 'comfortable' | 'spacious';
  className?: string;
}

export function JapaneseLayout({ 
  children, 
  showSeasonalTheme = true, 
  density = 'comfortable',
  className = '' 
}: JapaneseLayoutProps) {
  const t = useTranslations();
  const currentSeason = japaneseUtils.getJapaneseSeason();
  const seasonalTheme = SEASONAL_THEMES[currentSeason];

  const densityClasses = {
    compact: 'space-y-2 p-2',
    comfortable: 'space-y-4 p-4',
    spacious: 'space-y-6 p-6'
  };

  const seasonalStyles = showSeasonalTheme ? {
    '--seasonal-color': seasonalTheme.color,
    '--seasonal-background': seasonalTheme.background
  } : {};

  return (
    <div 
      className={`
        japanese-layout 
        ${densityClasses[density]}
        ${showSeasonalTheme ? 'seasonal-theme' : ''}
        ${className}
      `}
      style={seasonalStyles as React.CSSProperties}
    >
      {showSeasonalTheme && (
        <div className="seasonal-header flex items-center gap-2 mb-4 p-2 rounded-lg bg-gradient-to-r from-opacity-10 to-opacity-5">
          <span className="text-2xl">{seasonalTheme.emoji}</span>
          <span className="text-sm text-gray-600 japanese-text">
            {t(`seasonal.${currentSeason}.greeting`)}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export default JapaneseLayout;