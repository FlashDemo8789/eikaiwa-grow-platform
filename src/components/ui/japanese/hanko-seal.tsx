'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface HankoSealProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  style?: 'traditional' | 'modern' | 'school';
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function HankoSeal({
  name,
  size = 'medium',
  style = 'traditional',
  color = '#cc0000',
  onClick,
  className = ''
}: HankoSealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const sizeConfig = {
    small: { width: 40, height: 40, fontSize: 12 },
    medium: { width: 60, height: 60, fontSize: 16 },
    large: { width: 80, height: 80, fontSize: 20 }
  };
  
  const config = sizeConfig[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height, fontSize } = config;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Configure text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Extract characters for hanko (typically surname or full name)
    const characters = name.trim().split('').slice(0, 3);
    
    if (style === 'traditional') {
      // Traditional vertical arrangement
      if (characters.length === 1) {
        ctx.fillText(characters[0], width / 2, height / 2);
      } else if (characters.length === 2) {
        ctx.fillText(characters[0], width / 2, height / 2 - fontSize / 3);
        ctx.fillText(characters[1], width / 2, height / 2 + fontSize / 3);
      } else if (characters.length === 3) {
        ctx.fillText(characters[0], width / 2, height / 2 - fontSize / 2);
        ctx.fillText(characters[1], width / 2, height / 2);
        ctx.fillText(characters[2], width / 2, height / 2 + fontSize / 2);
      }
    } else if (style === 'modern') {
      // Modern horizontal arrangement
      const text = characters.join('');
      ctx.fillText(text, width / 2, height / 2);
    } else if (style === 'school') {
      // School style with smaller font
      ctx.font = `${fontSize - 2}px 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif`;
      const text = characters.join('');
      ctx.fillText(text, width / 2, height / 2);
      
      // Add small border inside
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
  }, [name, size, style, color, config]);
  
  return (
    <div 
      className={`hanko-seal inline-block cursor-pointer ${className}`}
      onClick={onClick}
      title={`${name}の印鑑`}
    >
      <canvas 
        ref={canvasRef}
        className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
      />
    </div>
  );
}

interface DocumentSealProps {
  documentTitle: string;
  signatories: Array<{
    name: string;
    title: string;
    date?: Date;
  }>;
  className?: string;
}

export function DocumentSeal({ documentTitle, signatories, className = '' }: DocumentSealProps) {
  const t = useTranslations();
  
  return (
    <div className={`document-seal bg-white p-6 border-2 border-gray-300 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold japanese-title mb-2">{documentTitle}</h3>
        <p className="text-sm text-gray-600">上記の通り承認いたします</p>
      </div>
      
      <div className="space-y-4">
        {signatories.map((signatory, index) => (
          <div key={index} className="flex items-center justify-between border-b pb-3">
            <div className="flex-1">
              <p className="font-medium japanese-name">{signatory.title}</p>
              <p className="text-sm text-gray-600">{signatory.name}</p>
              {signatory.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {signatory.date.getFullYear()}年{signatory.date.getMonth() + 1}月{signatory.date.getDate()}日
                </p>
              )}
            </div>
            <div className="ml-4">
              <HankoSeal 
                name={signatory.name} 
                size="medium" 
                style="traditional"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          この文書は電子印鑑により承認されています
        </p>
      </div>
    </div>
  );
}

interface HankoCreatorProps {
  onSave: (hankoConfig: any) => void;
  className?: string;
}

export function HankoCreator({ onSave, className = '' }: HankoCreatorProps) {
  const t = useTranslations();
  const [config, setConfig] = React.useState({
    name: '',
    size: 'medium' as const,
    style: 'traditional' as const,
    color: '#cc0000'
  });

  const handleSave = () => {
    if (config.name.trim()) {
      onSave(config);
    }
  };

  return (
    <div className={`hanko-creator p-4 border rounded-lg bg-gray-50 ${className}`}>
      <h3 className="font-medium mb-4 japanese-heading">印鑑作成</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">お名前</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="山田太郎"
            className="w-full px-3 py-2 border rounded-md"
            maxLength={6}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">サイズ</label>
            <select
              value={config.size}
              onChange={(e) => setConfig({ ...config, size: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="small">小 (40px)</option>
              <option value="medium">中 (60px)</option>
              <option value="large">大 (80px)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">スタイル</label>
            <select
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="traditional">伝統的</option>
              <option value="modern">モダン</option>
              <option value="school">学校用</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">色</label>
          <div className="flex gap-2">
            {['#cc0000', '#b8860b', '#2e8b57', '#191970', '#800080'].map((color) => (
              <button
                key={color}
                onClick={() => setConfig({ ...config, color })}
                className={`w-8 h-8 rounded-full border-2 ${
                  config.color === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium mb-2">プレビュー</p>
            <HankoSeal {...config} />
          </div>
          
          <button
            onClick={handleSave}
            disabled={!config.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}