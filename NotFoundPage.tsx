import { Link } from "react-router-dom";
import { EmptyState } from "../components/States";

export function NotFoundPage() {
  return (
    <div className="page page--top">
      <EmptyState
        title="Página não encontrada"
        text="O endereço que você abriu não existe ou foi removido."
        action={
          <Link to="/" className="btn btn--primary">
            Voltar ao início
          </Link>
        }
      />
    </div>
  );
}
