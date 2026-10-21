import { Link } from "react-router-dom";
import { AlbumCard, ArtistCard } from "../components/Cards";
import { Cover } from "../components/Cover";
import { Hero } from "../components/Hero";
import { Icon } from "../components/Icons";
import { ErrorState, Loading, Section } from "../components/States";
import { TrackList } from "../components/TrackList";
import { useAuth } from "../contexts/AuthContext";
import { usePlaylists } from "../contexts/PlaylistsContext";
import { useAsync } from "../hooks/useAsync";
import { catalogApi, historyApi } from "../services/api";
import { firstName, greeting, uniqueBy } from "../utils/format";

export function HomePage() {
  const { user } = useAuth();
  const { playlists } = usePlaylists();
  const state = useAsync(
    () =>
      Promise.all([
        catalogApi.recentTracks(8),
        catalogApi.featuredArtists(),
        catalogApi.featuredAlbums(),
        historyApi.recent(30),
      ]),
    [],
  );

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return <ErrorState message={state.error ?? "Não foi possível carregar o início."} onRetry={state.reload} />;
  }

  const [recent, artists, albums, history] = state.data;
  const played = uniqueBy(history, (entry) => entry.track.id)
    .slice(0, 6)
    .map((entry) => entry.track);

  return (
    <>
      <Hero
        title={`${greeting()}, ${firstName(user?.name ?? "")}`}
        subtitle="O que vamos ouvir agora?"
        glow={recent[0]?.coverUrl}
      />
      <div className="page">
        <div className="quick">
          <Link to="/favorites" className="quick__tile">
            <span className="quick__icon">
              <Icon name="heart-filled" size={22} />
            </span>
            <span className="quick__name">Músicas favoritas</span>
          </Link>
          {playlists.slice(0, 5).map((playlist) => (
            <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="quick__tile">
              <Cover src={null} alt="" size={64} label={playlist.name} />
              <span className="quick__name">{playlist.name}</span>
            </Link>
          ))}
        </div>

        <Section title="Adicionadas recentemente">
          <TrackList tracks={recent} />
        </Section>

        {played.length > 0 && (
          <Section title="Tocadas recentemente" action={<Link to="/history">Ver histórico</Link>}>
            <TrackList tracks={played} showAlbum={false} />
          </Section>
        )}

        <Section title="Artistas em destaque" note="Seleção de demonstração">
          <div className="grid">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </Section>

        <Section title="Álbuns em destaque" note="Seleção de demonstração">
          <div className="grid">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
