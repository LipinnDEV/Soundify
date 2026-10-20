import { useEffect, useState, type CSSProperties } from "react";

interface CoverProps {
  src?: string | null;
  alt: string;
  size?: number;
  round?: boolean;
  className?: string;
  /** Texto usado para a letra e a cor do fundo quando não há imagem. */
  label?: string;
}

/** Tom verde-azulado estável a partir do texto, para capas sem imagem não ficarem todas iguais. */
function fallbackStyle(label: string): CSSProperties {
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  const hue = 140 + (hash % 70);
  return { background: `linear-gradient(145deg, hsl(${hue} 30% 26%), hsl(${hue + 30} 28% 13%))` };
}

export function Cover({ src, alt, size, round = false, className = "", label }: CoverProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const classes = ["cover", round ? "cover--round" : "", className].filter(Boolean).join(" ");
  const sizing: CSSProperties | undefined = size ? { width: size, height: size } : undefined;

  if (!src || failed) {
    const text = label ?? alt;
    return (
      <div
        className={`${classes} cover--fallback`}
        style={{ ...sizing, ...fallbackStyle(text), ...(size ? { fontSize: Math.max(12, Math.round(size * 0.42)) } : {}) }}
        role="img"
        aria-label={alt || text}
      >
        {text.charAt(0).toUpperCase()}
      </div>
    );
  }
  return <img className={classes} style={sizing} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
