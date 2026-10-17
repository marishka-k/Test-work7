export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="max-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f8cff" />
          <stop offset="1" stopColor="#8a3ffc" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#max-logo)" />
      <path d="M18 44V20h6l8 12 8-12h6v24h-6V30l-8 11-8-11v14z" fill="#fff" />
    </svg>
  );
}
