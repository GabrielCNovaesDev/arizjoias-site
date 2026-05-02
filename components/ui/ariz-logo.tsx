'use client';

interface ArizLogoMarkProps {
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
}

/** Leaf mark — almond silhouette with midrib, from design spec */
export function ArizLogoMark({
  size = 48,
  color = 'var(--color-sage-dark)',
  stroke = 1.3,
  className = '',
}: ArizLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
      className={className}
    >
      {/* outer leaf silhouette */}
      <path
        d="M18 54 C 14 44, 17 28, 28 18 C 38 9, 50 9, 52 10 C 53 12, 50 26, 42 38 C 34 48, 24 54, 18 54 Z"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* midrib */}
      <path
        d="M22 50 C 26 42, 32 33, 42 24"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ArizWordmarkProps {
  size?: number;
  color?: string;
  tagline?: boolean;
}

export function ArizWordmark({
  size = 28,
  color = 'currentColor',
  tagline = true,
}: ArizWordmarkProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: size,
          letterSpacing: '0.32em',
          lineHeight: 1,
          paddingLeft: '0.32em',
        }}
      >
        ARIZ JOIAS
      </div>
      {tagline && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: size * 0.28,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            paddingLeft: '0.28em',
          }}
        >
          joias com leveza e alma
        </div>
      )}
    </div>
  );
}

interface ArizLogoLockupProps {
  mark?: number;
  word?: number;
  color?: string;
  tagline?: boolean;
}

export function ArizLogoLockup({
  mark = 40,
  word = 20,
  color = 'var(--color-text)',
  tagline = false,
}: ArizLogoLockupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <ArizLogoMark size={mark} />
      <ArizWordmark size={word} color={color} tagline={tagline} />
    </div>
  );
}

// Legacy exports for backward compat
export { ArizLogoMark as ArizLogo, ArizLogoLockup as ArizLogotype };
