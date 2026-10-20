import { useCallback, useRef, useState } from "react";
import { usePlaylists } from "../contexts/PlaylistsContext";
import { useToast } from "../contexts/ToastContext";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { playlistApi } from "../services/api";
import { getErrorMessage } from "../services/http";
import type { PlaylistDetail, PlaylistSummary } from "../types/api";
import { Icon } from "./Icons";

/** Botão "+" de cada música: abre um menu com as playlists do usuário (e a opção de criar uma nova). */
export function AddToPlaylist({ trackId }: { trackId: number }) {
  const { playlists, openCreate, refresh } = usePlaylists();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(wrapperRef, close, open);

  const addTo = async (playlist: { id: number; name: string }) => {
    try {
      await playlistApi.addTrack(playlist.id, trackId);
      toast.show(`Adicionada a “${playlist.name}”`, "success");
      await refresh();
    } catch (error) {
      toast.show(getErrorMessage(error), "error");
    }
  };

  const choose = (playlist: PlaylistSummary) => {
    setOpen(false);
    void addTo(playlist);
  };

  const createAndAdd = () => {
    setOpen(false);
    openCreate((created: PlaylistDetail) => void addTo(created));
  };

  return (
    <div className="menu-wrap" ref={wrapperRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Adicionar à playlist"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="plus" size={18} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <p className="menu__title">Adicionar à playlist</p>
          {playlists.length === 0 && <p className="menu__empty">Você ainda não tem playlists.</p>}
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <button type="button" role="menuitem" onClick={() => choose(playlist)}>
                  {playlist.name}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" role="menuitem" className="menu__create" onClick={createAndAdd}>
            Nova playlist…
          </button>
        </div>
      )}
    </div>
  );
}
