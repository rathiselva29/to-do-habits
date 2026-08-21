import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  textClassName = '',
}) => {
  let pixelSize = 36;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'sm':
        pixelSize = 26;
        break;
      case 'md':
        pixelSize = 36;
        break;
      case 'lg':
        pixelSize = 48;
        break;
      case 'xl':
        pixelSize = 64;
        break;
    }
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className="relative shrink-0 rounded-2xl overflow-hidden shadow-md shadow-emerald-500/20 flex items-center justify-center transition-transform hover:scale-105"
      >
        <svg
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo_g00" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8cd953" />
              <stop offset="100%" stopColor="#6ebf3e" />
            </linearGradient>
            <linearGradient id="logo_g01" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#55c142" />
              <stop offset="100%" stopColor="#3da42d" />
            </linearGradient>
            <linearGradient id="logo_g02" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52bc41" />
              <stop offset="100%" stopColor="#3ca02e" />
            </linearGradient>
            <linearGradient id="logo_g10" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9de25e" />
              <stop offset="100%" stopColor="#75c542" />
            </linearGradient>
            <linearGradient id="logo_g11" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94dc57" />
              <stop offset="100%" stopColor="#73c43e" />
            </linearGradient>
            <linearGradient id="logo_g12" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4aa73a" />
              <stop offset="100%" stopColor="#388c2b" />
            </linearGradient>
            <linearGradient id="logo_g20" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#90d853" />
              <stop offset="100%" stopColor="#6bbd3a" />
            </linearGradient>
            <linearGradient id="logo_g21" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ec040" />
              <stop offset="100%" stopColor="#529e2f" />
            </linearGradient>
            <linearGradient id="logo_g22" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#429b34" />
              <stop offset="100%" stopColor="#2d7a22" />
            </linearGradient>
          </defs>

          {/* Row 0 */}
          <rect x="6" y="6" width="32" height="32" rx="9" fill="url(#logo_g00)" />
          
          <rect x="44" y="6" width="32" height="32" rx="9" fill="url(#logo_g01)" />
          <path
            d="M50 22 L57 29 L70 15"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect x="82" y="6" width="32" height="32" rx="9" fill="url(#logo_g02)" />
          <path
            d="M88 22 L95 29 L108 15"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Row 1 */}
          <rect x="6" y="44" width="32" height="32" rx="9" fill="url(#logo_g10)" />
          <path
            d="M12 60 L19 67 L32 53"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect x="44" y="44" width="32" height="32" rx="9" fill="url(#logo_g11)" />
          <rect x="82" y="44" width="32" height="32" rx="9" fill="url(#logo_g12)" />

          {/* Row 2 */}
          <rect x="6" y="82" width="32" height="32" rx="9" fill="url(#logo_g20)" />
          <rect x="44" y="82" width="32" height="32" rx="9" fill="url(#logo_g21)" />
          <rect x="82" y="82" width="32" height="32" rx="9" fill="url(#logo_g22)" />
        </svg>
      </div>

      {showText && (
        <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${textClassName || 'text-base sm:text-lg'}`}>
          To-Do-<span className="text-emerald-500">Habits</span>
        </span>
      )}
    </div>
  );
};
