import { useEffect, useRef, useState, type FormEvent } from "react";
import { getErrorMessage, getFieldErrors } from "../services/http";

interface PlaylistFormModalProps {
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  onClose: () => void;
  /** Deve lançar erro se falhar; em caso de sucesso, quem chama fecha o modal. */
  onSubmit: (name: string, description: string) => Promise<void>;
}

export function PlaylistFormModal({
  mode,
  initialName = "",
  initialDescription = "",
  onClose,
  onSubmit,
}: PlaylistFormModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setFieldErrors({ name: "Dê um nome para a playlist." });
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit(name.trim(), description.trim());
    } catch (reason) {
      setError(getErrorMessage(reason));
      setFieldErrors(getFieldErrors(reason));
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="playlist-modal-title">
        <h2 id="playlist-modal-title">{mode === "create" ? "Nova playlist" : "Editar playlist"}</h2>
        <form onSubmit={submit} noValidate>
          <label className="field">
            <span>Nome</span>
            <input
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              placeholder="Ex.: Foco para estudar"
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && <small className="field__error">{fieldErrors.name}</small>}
          </label>
          <label className="field">
            <span>Descrição (opcional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={3}
            />
            {fieldErrors.description && <small className="field__error">{fieldErrors.description}</small>}
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Salvando…" : mode === "create" ? "Criar playlist" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
