import { Link } from "react-router-dom";
import { useQuickPlay } from "../hooks/useQuickPlay";
import { catalogApi, playlistApi } from "../services/api";
import type { Album, Artist, PlaylistSummary } from "../types/api";
import { formatTotal, pluralize } from "../utils/format";
import { Cover } from "./Cover";
import { Icon } from "./Icons";

export function AlbumCard({ album }: { album: Album }) {
  const quickPlay = useQuickPlay();
  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/albums/${album.id}`} aria-label={`Abrir o álbum ${album.title}`}>
          <Cover src={album.coverUrl} alt="" label={album.title} />
        </Link>
        <button
          type="button"
          className="card__play"
          aria-label={`Tocar ${album.title}`}
          onClick={() => void quickPlay(() => catalogApi.albumTracks(album.id))}
        >
          <Icon name="play" size={22} />
        </button>
      </div>
      <Link className="card__title" to={`/albums/${album.id}`}>
        {album.title}
      </Link>
      <span className="card__sub">
        {album.artist.name}
        {album.releaseYear ? `, ${album.releaseYear}` : ""}
      </span>
    </article>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const quickPlay = useQuickPlay();
  return (
    <article className="card card--artist">
      <div className="card__media">
        <Link to={`/artists/${artist.id}`} aria-label={`Abrir o perfil de ${artist.name}`}>
          <Cover src={artist.imageUrl} alt="" round label={artist.name} />
        </Link>
        <button
          type="button"
          className="card__play"
          aria-label={`Tocar músicas de ${artist.name}`}
          onClick={() => void quickPlay(() => catalogApi.artistTracks(artist.id))}
        >
          <Icon name="play" size={22} />
        </button>
      </div>
      <Link className="card__title" to={`/artists/${artist.id}`}>
        {artist.name}
      </Link>
      <span className="card__sub">Artista</span>
    </article>
  );
}

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  const quickPlay = useQuickPlay();
  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/playlists/${playlist.id}`} aria-label={`Abrir a playlist ${playlist.name}`}>
          <Cover src={null} alt="" label={playlist.name} />
        </Link>
        <button
          type="button"
          className="card__play"
          aria-label={`Tocar ${playlist.name}`}
          onClick={() =>
            void quickPlay(async () => (await playlistApi.get(playlist.id)).tracks.map((item) => item.track))
          }
        >
          <Icon name="play" size={22} />
        </button>
      </div>
      <Link className="card__title" to={`/playlists/${playlist.id}`}>
        {playlist.name}
      </Link>
      <span className="card__sub">
        {pluralize(playlist.trackCount, "música", "músicas")}
        {playlist.trackCount > 0 ? `, ${formatTotal(playlist.totalDurationSeconds)}` : ""}
      </span>
    </article>
  );
}
