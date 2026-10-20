import { Link, NavLink, useNavigate } from "react-router-dom";
import { usePlaylists } from "../contexts/PlaylistsContext";
import { useToast } from "../contexts/ToastContext";
import { pluralize } from "../utils/format";
import { Cover } from "./Cover";
import { Icon, type IconName } from "./Icons";
import { Logo } from "./Logo";

function NavItem({ to, icon, label, end }: { to: string; icon: IconName; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}>
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { playlists, openCreate } = usePlaylists();
  const navigate = useNavigate();
  const toast = useToast();

  const create = () =>
    openCreate((created) => {
      toast.show(`Playlist “${created.name}” criada`, "success");
      navigate(`/playlists/${created.id}`);
    });

  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <Link to="/" className="sidebar__brand" aria-label="Soundify, página inicial">
        <Logo />
      </Link>

      <nav className="sidebar__nav">
        <NavItem to="/" end icon="home" label="Início" />
        <NavItem to="/search" icon="search" label="Buscar" />
        <NavItem to="/library" icon="library" label="Biblioteca" />
        <NavItem to="/favorites" icon="heart" label="Favoritas" />
        <NavItem to="/history" icon="clock" label="Histórico" />
      </nav>

      <div className="sidebar__playlists">
        <div className="sidebar__heading">
          <span>Suas playlists</span>
          <button type="button" className="icon-btn" aria-label="Criar playlist" onClick={create}>
            <Icon name="plus" size={18} />
          </button>
        </div>
        {playlists.length === 0 ? (
          <p className="sidebar__empty">Crie sua primeira playlist com o botão +.</p>
        ) : (
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <NavLink
                  to={`/playlists/${playlist.id}`}
                  className={({ isActive }) => `playlist-link${isActive ? " is-active" : ""}`}
                >
                  <Cover src={null} alt="" size={40} label={playlist.name} />
                  <span className="playlist-link__text">
                    <span className="playlist-link__name">{playlist.name}</span>
                    <span className="playlist-link__meta">{pluralize(playlist.trackCount, "música", "músicas")}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a className="sidebar__docs" href="/swagger-ui.html" target="_blank" rel="noreferrer">
        Documentação da API
      </a>
    </aside>
  );
}
