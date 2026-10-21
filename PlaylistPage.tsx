import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Cover } from "../components/Cover";
import { Hero } from "../components/Hero";
import { Icon } from "../components/Icons";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../contexts/PlayerContext";
import { usePlaylists } from "../contexts/PlaylistsContext";
import { useToast } from "../contexts/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { playlistApi } from "../services/api";
import { getErrorMessage } from "../services/http";
import type { PlaylistDetail, Track } from "../types/api";
import { formatTotal, pluralize } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

export function PlaylistPage() {
  const { id } = useParams();
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return <NotFoundPage />;
  return <PlaylistView key={numericId} id={numericId} />;
}

function PlaylistView({ id }: { id: number }) {
  const navigate = useNavigate();
  const toast = useToast();
  const player = usePlayer();
  const { openEdit, refresh } = usePlaylists();
  const state = useAsync(() => playlistApi.get(id), [id]);
  const { setData } = state;

  const tracks = useMemo(() => state.data?.tracks.map((item) => item.track) ?? [], [state.data]);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "Playlist não encontrada."} onRetry={state.reload} />
      </div>
    );
  }
  const playlist = state.data;

  // Toda alteração devolve a playlist atualizada: basta trocar o estado e renovar a barra lateral.
  const apply = async (action: () => Promise<PlaylistDetail>) => {
    try {
      setData(await action());
      await refresh();
    } catch (error) {
      toast.show(getErrorMessage(error), "error");
    }
  };

  const remove = (track: Track) => void apply(() => playlistApi.removeTrack(id, track.id));

  const move = (track: Track, direction: -1 | 1) => {
    const ids = tracks.map((item) => item.id);
    const from = ids.indexOf(track.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    void apply(() => playlistApi.reorder(id, ids));
  };

  const edit = () =>
    openEdit(playlist, (saved) => {
      setData(saved);
      toast.show("Playlist atualizada", "success");
    });

  const destroy = async () => {
    if (!window.confirm(`Excluir a playlist “${playlist.name}”? Essa ação não pode ser desfeita.`)) return;
    try {
      await playlistApi.remove(id);
      await refresh();
      toast.show("Playlist excluída", "success");
      navigate("/library", { replace: true });
    } catch (error) {
      toast.show(getErrorMessage(error), "error");
    }
  };

  return (
    <>
      <Hero
        glow={tracks[0]?.coverUrl}
        media={<Cover src={null} alt="" size={208} label={playlist.name} />}
        title={playlist.name}
        subtitle={playlist.description ?? "Sua playlist"}
        meta={
          <>
            <span>{pluralize(playlist.trackCount, "música", "músicas")}</span>
            {playlist.trackCount > 0 ? <span>{formatTotal(playlist.totalDurationSeconds)}</span> : null}
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={tracks.length === 0}
              onClick={() => player.playQueue(tracks, 0)}
            >
              <Icon name="play" size={18} /> Ouvir
            </button>
            <button type="button" className="btn btn--ghost" onClick={edit}>
              <Icon name="edit" size={16} /> Editar
            </button>
            <button type="button" className="btn btn--ghost btn--danger" onClick={() => void destroy()}>
              <Icon name="trash" size={16} /> Excluir
            </button>
          </>
        }
      />
      <div className="page">
        {tracks.length === 0 ? (
          <EmptyState
            title="Playlist vazia"
            text="Adicione músicas com o botão + que aparece em cada faixa do catálogo."
          />
        ) : (
          <TrackList tracks={tracks} playlistActions={{ onRemove: remove, onMove: move }} />
        )}
      </div>
    </>
  );
}
