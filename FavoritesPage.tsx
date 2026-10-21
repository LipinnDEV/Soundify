import { useMemo, useState } from "react";
import { Hero } from "../components/Hero";
import { Icon } from "../components/Icons";
import { Pager } from "../components/Pager";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { TrackList } from "../components/TrackList";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useAsync } from "../hooks/useAsync";
import { favoriteApi } from "../services/api";
import { pluralize } from "../utils/format";

export function FavoritesPage() {
  const favorites = useFavorites();
  const player = usePlayer();
  const [page, setPage] = useState(0);
  const state = useAsync(() => favoriteApi.list(page, 20), [page]);

  // Quem é desfavoritado some da lista na hora, sem esperar nova consulta.
  const tracks = useMemo(
    () => (state.data?.content ?? []).filter((track) => !favorites.ready || favorites.isFavorite(track.id)),
    [state.data, favorites],
  );

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "Não foi possível carregar as favoritas."} onRetry={state.reload} />
      </div>
    );
  }

  return (
    <>
      <Hero
        title="Músicas favoritas"
        subtitle="Tudo o que você marcou com o coração."
        meta={<span>{pluralize(state.data.totalElements, "música", "músicas")}</span>}
        glow={tracks[0]?.coverUrl}
        actions={
          tracks.length > 0 ? (
            <button type="button" className="btn btn--primary btn--lg" onClick={() => player.playQueue(tracks, 0)}>
              <Icon name="play" size={18} /> Ouvir
            </button>
          ) : undefined
        }
      />
      <div className="page">
        {tracks.length === 0 ? (
          <EmptyState title="Nenhuma favorita por aqui" text="Toque no coração de qualquer música para guardá-la." />
        ) : (
          <TrackList tracks={tracks} />
        )}
        <Pager page={state.data.page} totalPages={state.data.totalPages} onChange={setPage} />
      </div>
    </>
  );
}
