/** Marca do Soundify: quatro barras de equalizador em um quadrado arredondado + nome em minúsculas. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="9" style={{ fill: "var(--accent)" }} />
        <g style={{ fill: "var(--accent-ink)" }}>
          <rect x="6" y="13" width="3.4" height="6" rx="1.7" />
          <rect x="11.2" y="8" width="3.4" height="16" rx="1.7" />
          <rect x="16.4" y="11" width="3.4" height="10" rx="1.7" />
          <rect x="21.6" y="6" width="3.4" height="20" rx="1.7" />
        </g>
      </svg>
      <span className="logo__word">soundify</span>
    </span>
  );
}
