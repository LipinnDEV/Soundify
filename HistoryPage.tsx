import { EmptyState, ErrorState, Loading } from "../components/States";
import { TrackList } from "../components/TrackList";
import { useAsync } from "../hooks/useAsync";
import { historyApi } from "../services/api";
import { uniqueBy } from "../utils/format";

export function HistoryPage() {
  const state = useAsync(() => historyApi.recent(50), []);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "Não foi possível carregar o histórico."} onRetry={state.reload} />
      </div>
    );
  }

  const tracks = uniqueBy(state.data, (entry) => entry.track.id).map((entry) => entry.track);

  return (
    <div className="page page--top">
      <h1 className="page__title">Histórico</h1>
      <p className="page__lead">Só entram aqui as músicas que realmente começaram a tocar.</p>
      {tracks.length === 0 ? (
        <EmptyState title="Seu histórico está vazio" text="Escute alguma música por alguns segundos e ela aparece aqui." />
      ) : (
        <TrackList tracks={tracks} showAlbum={false} />
      )}
    </div>
  );
}
