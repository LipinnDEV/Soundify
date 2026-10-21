import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage, getFieldErrors } from "../services/http";

function AuthShell({ title, subtitle, footer, children }: { title: string; subtitle: string; footer: ReactNode; children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth__card">
        <Logo size={38} />
        <h1>{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
        <p className="auth__footer">{footer}</p>
      </div>
      <p className="auth__note">
        Projeto de portfólio: o catálogo é fictício e os áudios foram sintetizados para a demonstração.
      </p>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Em caso de sucesso, PublicOnlyRoute percebe o usuário autenticado e redireciona sozinho.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (reason) {
      setError(getErrorMessage(reason, "Não foi possível entrar."));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Entrar"
      subtitle="Continue de onde parou."
      footer={
        <>
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={submitting || !email || !password}>
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const problems: Record<string, string> = {};
    if (!name.trim()) problems.name = "Informe seu nome.";
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      problems.password = "Use 8 caracteres ou mais, com letras e números.";
    }
    if (confirm !== password) problems.confirm = "As senhas não são iguais.";
    setFieldErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (reason) {
      setError(getErrorMessage(reason, "Não foi possível criar a conta."));
      setFieldErrors(getFieldErrors(reason));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <label className="field">
          <span>Nome</span>
          <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
          {fieldErrors.name && <small className="field__error">{fieldErrors.name}</small>}
        </label>
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {fieldErrors.email && <small className="field__error">{fieldErrors.email}</small>}
        </label>
        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={72}
          />
          {fieldErrors.password && <small className="field__error">{fieldErrors.password}</small>}
        </label>
        <label className="field">
          <span>Confirmar senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            maxLength={72}
          />
          {fieldErrors.confirm && <small className="field__error">{fieldErrors.confirm}</small>}
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={submitting || !email}>
          {submitting ? "Criando conta…" : "Criar conta"}
        </button>
      </form>
    </AuthShell>
  );
}
