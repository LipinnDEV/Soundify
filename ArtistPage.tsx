import { useParams } from "react-router-dom";
import { AlbumCard } from "../components/Cards";
import { Cover } from "../components/Cover";
import { Hero } from "../components/Hero";
import { Icon } from "../components/Icons";
import { ErrorState, Loading, Section } from "../components/States";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../contexts/PlayerContext";
import { useAsync } from "../hooks/useAsync";
import { catalogApi } from "../services/api";
import { pluralize } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

export function ArtistPage() {
  const { id } = useParams();
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return <NotFoundPage />;
  return <ArtistView key={numericId} id={numericId} />;
}

function ArtistView({ id }: { id: number }) {
  const player = usePlayer();
  const state = useAsync(
    () => Promise.all([catalogApi.artist(id), catalogApi.artistTracks(id), catalogApi.artistAlbums(id)]),
    [id],
  );

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "Artista não encontrado."} onRetry={state.reload} />
      </div>
    );
  }

  const [artist, tracks, albums] = state.data;

  return (
    <>
      <Hero
        glow={albums[0]?.coverUrl ?? artist.imageUrl}
        media={<Cover src={artist.imageUrl} alt={artist.name} size={208} round label={artist.name} />}
        title={artist.name}
        subtitle={artist.bio}
        meta={
          <>
            <span>{pluralize(tracks.length, "música", "músicas")}</span>
            <span>{pluralize(albums.length, "álbum", "álbuns")}</span>
          </>
        }
        actions={
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={tracks.length === 0}
            onClick={() => player.playQueue(tracks, 0)}
          >
            <Icon name="play" size={18} /> Ouvir
          </button>
        }
      />
      <div className="page">
        <Section title="Músicas">
          <TrackList tracks={tracks} />
        </Section>
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
    </>
  );
}
