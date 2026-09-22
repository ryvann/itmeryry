import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  forceImage?: boolean;
  customLogoUrl?: string;
  storeName?: string;
  storeTagline?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  forceImage = false,
  customLogoUrl,
  storeName,
  storeTagline,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-base', subtext: 'text-[9px]' },
    md: { icon: 'w-11 h-11', text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl', subtext: 'text-xs' },
    xl: { icon: 'w-24 h-24', text: 'text-3xl', subtext: 'text-sm' },
  }[size];

  const logoSrc = customLogoUrl && customLogoUrl.trim() ? customLogoUrl : '/logo.jpg';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon (Image with SVG fallback) */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses.icon}`}>
        {!imgError ? (
          <img
            src={logoSrc}
            alt={storeName || "Logo BukuBerkatDMM"}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-lg drop-shadow-sm"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
          >
            {/* Background Glow */}
            <circle cx="100" cy="100" r="95" fill="#FAF5EB" />

            {/* Holy Spirit Golden Flame */}
            <path
              d="M100 20 C108 38 120 48 116 68 C113 80 105 88 100 92 C95 88 87 80 84 68 C80 48 92 38 100 20Z"
              fill="url(#goldGradient)"
            />
            <path
              d="M108 45 C120 58 132 72 126 90 C122 100 114 106 106 108 C115 98 118 84 114 74 C111 65 106 55 108 45Z"
              fill="#F59E0B"
            />
            <path
              d="M92 45 C80 58 68 72 74 90 C78 100 86 106 94 108 C85 98 82 84 86 74 C89 65 94 55 92 45Z"
              fill="#D97706"
            />

            {/* Open Bible Back/Cover (Navy) */}
            <path
              d="M100 110 C80 96 36 98 22 118 C20 128 26 150 96 158 L100 120 L104 158 C174 150 180 128 178 118 C164 98 120 96 100 110Z"
              fill="#0F2C59"
            />

            {/* Open Pages (Layered Cream/White) */}
            <path
              d="M100 115 C82 105 44 106 30 122 C48 126 78 132 98 144 L100 115Z"
              fill="#FEFDF9"
            />
            <path
              d="M100 115 C118 105 156 106 170 122 C152 126 122 132 102 144 L100 115Z"
              fill="#F8F6F0"
            />

            {/* Gold Page Edge Accent Ribbon */}
            <path
              d="M32 125 C50 129 78 136 98 148 L98 152 C76 140 48 133 30 129 Z"
              fill="#D97706"
            />
            <path
              d="M168 125 C150 129 122 136 102 148 L102 152 C124 140 152 133 170 129 Z"
              fill="#D97706"
            />

            {/* White Cross at the Center */}
            <rect x="97" y="78" width="6" height="34" rx="1.5" fill="#FFFFFF" />
            <rect x="91" y="85" width="18" height="5" rx="1.5" fill="#FFFFFF" />

            {/* Miniature Bottom Open Book Glyph */}
            <path
              d="M93 175 C96 173 99 174 100 176 C101 174 104 173 107 175 L107 181 C104 179 101 180 100 182 C99 180 96 179 93 181 Z"
              fill="#0F2C59"
            />
            <line x1="55" y1="178" x2="88" y2="178" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="112" y1="178" x2="145" y2="178" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <linearGradient id="goldGradient" x1="100" y1="20" x2="100" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Brand Typographic Identity */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-serif tracking-tight font-extrabold flex items-center ${sizeClasses.text}`}>
            {storeName && storeName.trim() !== 'BukuBerkatDMM' ? (
              <span className="text-[#0F2C59]">{storeName}</span>
            ) : (
              <>
                <span className="text-[#0F2C59]">Buku</span>
                <span className="text-[#D97706] ml-0.5">Berkat</span>
                <span className="text-[#0F2C59] ml-1">DMM</span>
              </>
            )}
          </div>
          <span className={`text-slate-500 font-sans tracking-wide uppercase font-semibold mt-0.5 ${sizeClasses.subtext}`}>
            {storeTagline || 'Rohani • Keluarga • Kesehatan • Maluku'}
          </span>
        </div>
      )}
    </div>
  );
};
