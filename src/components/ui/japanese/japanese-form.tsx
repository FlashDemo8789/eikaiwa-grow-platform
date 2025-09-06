'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { japaneseUtils, JAPANESE_PREFECTURES } from '@/services/japanese-utils.service';

interface JapaneseFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'zipcode' | 'furigana';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  rows?: number;
  validation?: (value: string) => string | null;
  helpText?: string;
}

export function JapaneseFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  options = [],
  maxLength,
  rows = 3,
  validation,
  helpText
}: JapaneseFormFieldProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateInput = (inputValue: string) => {
    if (required && !inputValue.trim()) {
      return t('validation.required');
    }

    if (validation) {
      const customError = validation(inputValue);
      if (customError) return customError;
    }

    switch (type) {
      case 'email':
        if (inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
          return t('validation.emailInvalid');
        }
        break;
      
      case 'tel':
        if (inputValue && !japaneseUtils.validateJapanesePhone(inputValue)) {
          return t('validation.phoneJapanese');
        }
        break;
      
      case 'zipcode':
        if (inputValue && !japaneseUtils.validateJapaneseZipCode(inputValue)) {
          return t('validation.zipCodeInvalid');
        }
        break;
      
      case 'furigana':
        if (inputValue && !japaneseUtils.containsHiragana(inputValue)) {
          return t('validation.furiganaRequired');
        }
        break;
    }

    return null;
  };

  const handleChange = (inputValue: string) => {
    let processedValue = inputValue;

    // Auto-format specific types
    if (type === 'tel') {
      processedValue = japaneseUtils.formatJapanesePhone(inputValue);
    } else if (type === 'zipcode') {
      processedValue = japaneseUtils.formatJapaneseZipCode(inputValue);
    }

    onChange(processedValue);
    
    if (touched) {
      setError(validateInput(processedValue));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateInput(value));
  };

  const renderInput = () => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-md
      japanese-input
      ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      ${error ? 'focus:ring-red-200' : 'focus:ring-blue-200'}
    `;

    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={baseClasses}
            required={required}
          >
            <option value="">{placeholder || '選択してください'}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            className={baseClasses}
            required={required}
          />
        );

      default:
        return (
          <input
            type={type === 'zipcode' || type === 'furigana' ? 'text' : type}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            className={baseClasses}
            required={required}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 japanese-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 japanese-error">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 japanese-help">
          {helpText}
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-400 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

interface JapaneseAddressFormProps {
  address: {
    zipCode: string;
    prefecture: string;
    city: string;
    town: string;
    building?: string;
  };
  onChange: (address: any) => void;
  required?: boolean;
}

export function JapaneseAddressForm({ address, onChange, required = false }: JapaneseAddressFormProps) {
  const t = useTranslations();

  const updateAddress = (field: string, value: string) => {
    onChange({
      ...address,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium text-gray-900 japanese-heading">住所</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JapaneseFormField
          label={t('students.zipCode')}
          name="zipCode"
          type="zipcode"
          value={address.zipCode}
          onChange={(value) => updateAddress('zipCode', value)}
          required={required}
          placeholder="123-4567"
          helpText="ハイフン付きで入力してください"
        />
        
        <JapaneseFormField
          label={t('students.prefecture')}
          name="prefecture"
          type="select"
          value={address.prefecture}
          onChange={(value) => updateAddress('prefecture', value)}
          options={JAPANESE_PREFECTURES}
          required={required}
          placeholder="都道府県を選択"
        />
      </div>
      
      <JapaneseFormField
        label={t('students.city')}
        name="city"
        type="text"
        value={address.city}
        onChange={(value) => updateAddress('city', value)}
        required={required}
        placeholder="市区町村"
      />
      
      <JapaneseFormField
        label="町名・番地"
        name="town"
        type="text"
        value={address.town}
        onChange={(value) => updateAddress('town', value)}
        required={required}
        placeholder="町名・番地"
      />
      
      <JapaneseFormField
        label="建物名・部屋番号"
        name="building"
        type="text"
        value={address.building || ''}
        onChange={(value) => updateAddress('building', value)}
        placeholder="マンション名・部屋番号（任意）"
      />
    </div>
  );
}

interface JapaneseNameFormProps {
  name: {
    kanji: string;
    furigana: string;
  };
  onChange: (name: any) => void;
  required?: boolean;
}

export function JapaneseNameForm({ name, onChange, required = false }: JapaneseNameFormProps) {
  const t = useTranslations();

  const updateName = (field: string, value: string) => {
    onChange({
      ...name,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <JapaneseFormField
        label="お名前（漢字）"
        name="kanjiName"
        type="text"
        value={name.kanji}
        onChange={(value) => updateName('kanji', value)}
        required={required}
        placeholder="山田 太郎"
        validation={(value) => {
          if (value && !japaneseUtils.containsKanji(value)) {
            return t('validation.kanjiRequired');
          }
          return null;
        }}
      />
      
      <JapaneseFormField
        label="ふりがな"
        name="furigana"
        type="furigana"
        value={name.furigana}
        onChange={(value) => updateName('furigana', value)}
        required={required}
        placeholder="やまだ たろう"
        helpText="ひらがなで入力してください"
      />
    </div>
  );
}