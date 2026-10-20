import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { PlayerProvider } from "../contexts/PlayerContext";
import { PlaylistsProvider } from "../contexts/PlaylistsContext";
import { PlayerBar } from "./PlayerBar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Estrutura das telas autenticadas: barra lateral, conteúdo e player fixo embaixo. */
export function AppLayout() {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // A rolagem acontece dentro da área de conteúdo: ao trocar de página, volta ao topo.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <FavoritesProvider>
      <PlaylistsProvider>
        <PlayerProvider>
          <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
          </a>
          <div className="shell">
            <Sidebar />
            <div className="shell__main" ref={scrollRef}>
              <Topbar />
              <main id="conteudo" tabIndex={-1}>
                <Outlet />
              </main>
            </div>
            <PlayerBar />
          </div>
        </PlayerProvider>
      </PlaylistsProvider>
    </FavoritesProvider>
  );
}
