import { Link, useParams } from "react-router-dom";
import { Cover } from "../components/Cover";
import { Hero } from "../components/Hero";
import { Icon } from "../components/Icons";
import { ErrorState, Loading } from "../components/States";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../contexts/PlayerContext";
import { useAsync } from "../hooks/useAsync";
import { catalogApi } from "../services/api";
import { formatTotal, pluralize } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

export function AlbumPage() {
  const { id } = useParams();
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return <NotFoundPage />;
  return <AlbumView key={numericId} id={numericId} />;
}

function AlbumView({ id }: { id: number }) {
  const player = usePlayer();
  const state = useAsync(() => Promise.all([catalogApi.album(id), catalogApi.albumTracks(id)]), [id]);

  if (state.loading && !state.data) return <Loading />;
  if (state.error || !state.data) {
    return (
      <div className="page page--top">
        <ErrorState message={state.error ?? "Álbum não encontrado."} onRetry={state.reload} />
      </div>
    );
  }

  const [album, tracks] = state.data;
  const totalSeconds = tracks.reduce((sum, track) => sum + track.durationSeconds, 0);

  return (
    <>
      <Hero
        glow={album.coverUrl}
        media={<Cover src={album.coverUrl} alt={`Capa do álbum ${album.title}`} size={208} label={album.title} />}
        title={album.title}
        subtitle={<Link to={`/artists/${album.artist.id}`}>{album.artist.name}</Link>}
        meta={
          <>
            {album.releaseYear ? <span>{album.releaseYear}</span> : null}
            <span>{pluralize(tracks.length, "faixa", "faixas")}</span>
            <span>{formatTotal(totalSeconds)}</span>
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
        <TrackList tracks={tracks} showAlbum={false} showCover={false} />
      </div>
    </>
  );
}
