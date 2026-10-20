import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { Icon } from "./Icons";

function searchUrl(query: string): string {
  return query ? `/search?q=${encodeURIComponent(query)}` : "/search";
}

/** Barra superior: busca global (com atraso de 350 ms enquanto digita) e menu da conta. */
export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const onSearchPage = location.pathname === "/search";
  const urlQuery = onSearchPage ? (new URLSearchParams(location.search).get("q") ?? "") : "";

  const [text, setText] = useState(urlQuery);
  const debounced = useDebounce(text, 350);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useOutsideClick(menuRef, closeMenu, menuOpen);

  // Mantém o campo igual à URL quando a busca muda por outro caminho (botão voltar, links de gênero...).
  useEffect(() => {
    if (onSearchPage) setText(urlQuery);
  }, [onSearchPage, urlQuery]);

  // Busca enquanto digita: quando o texto "assenta", atualiza a URL (/search?q=...).
  useEffect(() => {
    const query = debounced.trim();
    if (query === urlQuery.trim()) return;
    if (query === "" && !onSearchPage) return;
    navigate(searchUrl(query), { replace: onSearchPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(searchUrl(text.trim()));
  };

  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <form className="searchbox" role="search" onSubmit={submit}>
        <Icon name="search" size={18} />
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buscar músicas, artistas e álbuns"
          aria-label="Buscar músicas, artistas e álbuns"
          maxLength={80}
        />
      </form>

      <div className="account" ref={menuRef}>
        <button
          type="button"
          className="avatar"
          aria-label="Menu da conta"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {initial}
        </button>
        {menuOpen && (
          <div className="menu menu--right" role="menu">
            <p className="menu__title">{user?.name}</p>
            <Link role="menuitem" to="/profile" onClick={closeMenu} className="menu__link">
              <Icon name="user" size={16} /> Meu perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              className="menu__link"
              onClick={() => {
                closeMenu();
                void logout();
              }}
            >
              <Icon name="logout" size={16} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
