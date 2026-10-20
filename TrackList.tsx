import { Link } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePlayer } from "../contexts/PlayerContext";
import type { Track } from "../types/api";
import { formatDuration } from "../utils/format";
import { AddToPlaylist } from "./AddToPlaylist";
import { Cover } from "./Cover";
import { Icon } from "./Icons";

/** Ações extras que só existem dentro de uma playlist: reordenar e remover. */
export interface PlaylistTrackActions {
  onRemove: (track: Track) => void;
  onMove: (track: Track, direction: -1 | 1) => void;
}

interface TrackListProps {
  tracks: Track[];
  showAlbum?: boolean;
  showCover?: boolean;
  playlistActions?: PlaylistTrackActions;
}

/** Lista de músicas: tocar (a lista inteira vira a fila), favoritar, adicionar a playlist. */
export function TrackList({ tracks, showAlbum = true, showCover = true, playlistActions }: TrackListProps) {
  const player = usePlayer();
  const favorites = useFavorites();

  const play = (track: Track, index: number) => {
    if (player.currentTrack?.id === track.id) {
      player.togglePlay();
    } else {
      player.playQueue(tracks, index);
    }
  };

  return (
    <div className={`tracks${showAlbum ? "" : " tracks--no-album"}${playlistActions ? " tracks--editable" : ""}`}>
      <div className="tracks__head" aria-hidden="true">
        <span>#</span>
        <span>Título</span>
        {showAlbum && <span>Álbum</span>}
        <span />
        <span>Duração</span>
        <span />
      </div>
      <ol className="tracks__list">
        {tracks.map((track, index) => {
          const current = player.currentTrack?.id === track.id;
          const playing = current && player.isPlaying;
          const favorite = favorites.isFavorite(track.id);
          return (
            <li
              key={track.id}
              className={`track${current ? " track--current" : ""}`}
              onDoubleClick={() => play(track, index)}
            >
              <button
                type="button"
                className="track__play"
                aria-label={`${playing ? "Pausar" : "Tocar"} ${track.title}`}
                onClick={() => play(track, index)}
              >
                <span className="track__index">
                  {playing ? (
                    <span className="eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="track__icon">
                  <Icon name={playing ? "pause" : "play"} size={16} />
                </span>
              </button>

              <div className="track__main">
                {showCover && <Cover src={track.coverUrl} alt="" size={44} label={track.title} />}
                <div className="track__text">
                  <span className="track__title">{track.title}</span>
                  <Link className="track__artist" to={`/artists/${track.artist.id}`}>
                    {track.artist.name}
                  </Link>
                </div>
              </div>

              {showAlbum && (
                <div className="track__album">
                  {track.album ? (
                    <Link to={`/albums/${track.album.id}`}>{track.album.title}</Link>
                  ) : (
                    <span className="muted">Single</span>
                  )}
                </div>
              )}

              <button
                type="button"
                className={`icon-btn track__fav${favorite ? " is-active" : ""}`}
                aria-pressed={favorite}
                aria-label={favorite ? `Remover ${track.title} das favoritas` : `Favoritar ${track.title}`}
                onClick={() => void favorites.toggle(track.id)}
              >
                <Icon name={favorite ? "heart-filled" : "heart"} size={18} />
              </button>

              <span className="track__duration">{formatDuration(track.durationSeconds)}</span>

              <div className="track__actions">
                <AddToPlaylist trackId={track.id} />
                {playlistActions && (
                  <>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Mover ${track.title} para cima`}
                      disabled={index === 0}
                      onClick={() => playlistActions.onMove(track, -1)}
                    >
                      <Icon name="up" size={18} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Mover ${track.title} para baixo`}
                      disabled={index === tracks.length - 1}
                      onClick={() => playlistActions.onMove(track, 1)}
                    >
                      <Icon name="down" size={18} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      aria-label={`Remover ${track.title} da playlist`}
                      onClick={() => playlistActions.onRemove(track)}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
