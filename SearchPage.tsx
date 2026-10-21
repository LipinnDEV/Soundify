import { useSearchParams } from "react-router-dom";
import { AlbumCard, ArtistCard } from "../components/Cards";
import { Pager } from "../components/Pager";
import { EmptyState, ErrorState, Loading, Section } from "../components/States";
import { TrackList } from "../components/TrackList";
import { useAsync } from "../hooks/useAsync";
import { catalogApi } from "../services/api";

/** Com texto na busca mostra os resultados; sem texto, vira o "Explorar" (filtro por gênero + todas as músicas). */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const genre = params.get("genre") ?? "";
  const page = Math.max(0, Number(params.get("page") ?? "0") || 0);

  const change = (nextGenre: string, nextPage: number) => {
    const next = new URLSearchParams();
    if (nextGenre) next.set("genre", nextGenre);
    if (nextPage > 0) next.set("page", String(nextPage));
    setParams(next);
  };

  return query ? <SearchResultsView key={query} query={query} /> : <BrowseView genre={genre} page={page} onChange={change} />;
}

function SearchResultsView({ query }: { query: string }) {
  const state = useAsync(() => catalogApi.search(query, 8), [query]);

  if (state.loading && !state.data) return <Loading label="Buscando…" />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "A busca falhou."} onRetry={state.reload} />
      </div>
    );
  }

  const { tracks, artists, albums } = state.data;
  const empty = tracks.length === 0 && artists.length === 0 && albums.length === 0;

  return (
    <div className="page page--top">
      <h1 className="page__title">Resultados para “{query}”</h1>
      {empty && <EmptyState title="Nada encontrado" text="Tente outro termo ou confira a ortografia." />}
      {tracks.length > 0 && (
        <Section title="Músicas">
          <TrackList tracks={tracks} />
        </Section>
      )}
      {artists.length > 0 && (
        <Section title="Artistas">
          <div className="grid">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </Section>
      )}
      {albums.length > 0 && (
        <Section title="Álbuns">
          <div className="grid">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function BrowseView({ genre, page, onChange }: { genre: string; page: number; onChange: (genre: string, page: number) => void }) {
  const genres = useAsync(() => catalogApi.genres(), []);
  const tracks = useAsync(
    () => catalogApi.tracks({ genre: genre || undefined, sort: "title", page, size: 12 }),
    [genre, page],
  );

  return (
    <div className="page page--top">
      <h1 className="page__title">Explorar</h1>

      <div className="chips" role="group" aria-label="Filtrar por gênero">
        <button type="button" className={`chip-btn${genre === "" ? " is-active" : ""}`} onClick={() => onChange("", 0)}>
          Tudo
        </button>
        {(genres.data ?? []).map((name) => (
          <button
            key={name}
            type="button"
            className={`chip-btn${genre === name ? " is-active" : ""}`}
            aria-pressed={genre === name}
            onClick={() => onChange(name, 0)}
          >
            {name}
          </button>
        ))}
      </div>

      {tracks.loading && !tracks.data && <Loading />}
      {tracks.error && <ErrorState message={tracks.error} onRetry={tracks.reload} />}
      {tracks.data && tracks.data.content.length === 0 && (
        <EmptyState title="Nenhuma música neste gênero" text="Escolha outro gênero na lista acima." />
      )}
      {tracks.data && tracks.data.content.length > 0 && (
        <>
          <TrackList tracks={tracks.data.content} />
          <Pager page={tracks.data.page} totalPages={tracks.data.totalPages} onChange={(next) => onChange(genre, next)} />
        </>
      )}
    </div>
  );
}
