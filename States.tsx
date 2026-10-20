import type { ReactNode } from "react";

export function Loading({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fullpage">
      <Loading />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">Não deu certo</p>
      <p className="state__text">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="state">
      <p className="state__title">{title}</p>
      {text && <p className="state__text">{text}</p>}
      {action}
    </div>
  );
}

interface SectionProps {
  title: string;
  /** Aviso discreto ao lado do título (ex.: "Seleção de demonstração"). */
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, note, action, children }: SectionProps) {
  return (
    <section className="section">
      <header className="section__head">
        <h2>{title}</h2>
        {note && <span className="chip">{note}</span>}
        {action && <div className="section__action">{action}</div>}
      </header>
      {children}
    </section>
  );
}
