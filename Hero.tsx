import type { CSSProperties, ReactNode } from "react";

interface HeroProps {
  title: string;
  /** Imagem em destaque (capa, foto do artista). */
  media?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** URL da imagem usada como brilho de fundo (a capa desfocada colore a página). */
  glow?: string | null;
}

/** Cabeçalho das páginas de álbum, artista, playlist e início. */
export function Hero({ title, media, subtitle, meta, actions, glow }: HeroProps) {
  const style = glow ? ({ "--glow": `url("${glow}")` } as CSSProperties) : undefined;
  return (
    <header className="hero" style={style}>
      {media && <div className="hero__media">{media}</div>}
      <div className="hero__text">
        <h1 className="hero__title">{title}</h1>
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        {meta && <p className="hero__meta">{meta}</p>}
        {actions && <div className="hero__actions">{actions}</div>}
      </div>
    </header>
  );
}
