'use client';

interface ArizLogoProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 28, md: 40, lg: 56 };

export function ArizLogo({ className = '', color = '#5C6B50', size = 'md' }: ArizLogoProps) {
  const h = sizes[size];
  const w = Math.round(h * 0.72);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 72 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ariz Joias logo"
    >
      {/* Leaf outline */}
      <path
        d="M36 8 C52 8, 66 22, 66 42 C66 62, 52 80, 36 88 C20 80, 6 62, 6 42 C6 22, 20 8, 36 8 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner vein */}
      <path
        d="M36 20 C42 30, 44 50, 40 70"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ArizLogotype({
  className = '',
  color = '#5C6B50',
  size = 'md',
}: ArizLogoProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <ArizLogo color={color} size={size} />
      <div className="text-center" style={{ color }}>
        <p
          className="font-display tracking-[0.25em] font-light"
          style={{ fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.25rem' : '0.9375rem' }}
        >
          ARIZ JOIAS
        </p>
        <p
          className="font-body tracking-[0.12em] font-light opacity-75"
          style={{ fontSize: size === 'sm' ? '0.5rem' : size === 'lg' ? '0.65rem' : '0.55rem' }}
        >
          JOIAS COM LEVEZA E ALMA
        </p>
      </div>
    </div>
  );
}
