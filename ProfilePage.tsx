import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { userApi } from "../services/api";
import { getErrorMessage, getFieldErrors } from "../services/http";
import { formatDate } from "../utils/format";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const updated = await userApi.update({ name: name.trim(), email: email.trim() });
      setUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      toast.show("Perfil atualizado", "success");
    } catch (reason) {
      setError(getErrorMessage(reason, "Não foi possível salvar."));
      setFieldErrors(getFieldErrors(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page--top">
      <h1 className="page__title">Meu perfil</h1>
      <p className="page__lead">Conta criada em {formatDate(user.createdAt)}.</p>
      <form className="profile" onSubmit={submit} noValidate>
        <label className="field">
          <span>Nome</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
          {fieldErrors.name && <small className="field__error">{fieldErrors.name}</small>}
        </label>
        <label className="field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={150} />
          {fieldErrors.email && <small className="field__error">{fieldErrors.email}</small>}
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={saving || !changed || !name.trim() || !email.trim()}>
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
