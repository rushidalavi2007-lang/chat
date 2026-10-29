import React from 'react';

interface AetherLogoProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const AetherLogo: React.FC<AetherLogoProps> = ({
  size = 28,
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Abstract Intelligence Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:rotate-45"
      >
        <defs>
          <linearGradient id="aetherVioletGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <radialGradient id="aetherCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Fine Diamond Rhombus */}
        <rect
          x="20"
          y="3"
          width="24"
          height="24"
          rx="4"
          transform="rotate(45 20 3)"
          stroke="url(#aetherVioletGrad)"
          strokeWidth="1.75"
          strokeOpacity="0.85"
        />

        {/* Inner Secondary Counter-Rotated Square */}
        <rect
          x="10"
          y="10"
          width="20"
          height="20"
          rx="3"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.25"
        />

        {/* Precision Central Intelligence Core */}
        <circle cx="20" cy="20" r="3.5" fill="url(#aetherCoreGlow)" />
        <circle cx="20" cy="20" r="1.5" fill="#ffffff" />
      </svg>

      {/* Wordmark and Tagline */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-[0.2em] text-sm uppercase leading-none">
              AETHER
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] tracking-wide text-slate-400 mt-0.5 leading-none font-medium">
              Your Intelligence. Your Assistant.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
