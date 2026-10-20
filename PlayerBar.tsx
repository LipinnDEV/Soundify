import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePlayer, usePlayerProgress } from "../contexts/PlayerContext";
import { formatDuration } from "../utils/format";
import { Cover } from "./Cover";
import { Icon } from "./Icons";

function fill(percent: number): CSSProperties {
  return { "--fill": `${percent}%` } as CSSProperties;
}

/** Barra fixa de reprodução: faixa atual, controles, progresso e volume. */
export function PlayerBar() {
  const player = usePlayer();
  const { currentTime, duration } = usePlayerProgress();
  const favorites = useFavorites();

  const track = player.currentTrack;
  const total = duration > 0 ? duration : (track?.durationSeconds ?? 0);
  const shown = Math.min(currentTime, total);
  const progress = total > 0 ? (shown / total) * 100 : 0;
  const favorite = track ? favorites.isFavorite(track.id) : false;
  const volumeShown = player.muted ? 0 : player.volume;

  return (
    <footer className="player" aria-label="Player de música">
      <div className="player__now">
        {track ? (
          <>
            <Cover src={track.coverUrl} alt="" size={56} label={track.title} />
            <div className="player__text">
              <span className="player__title">{track.title}</span>
              <Link className="player__artist" to={`/artists/${track.artist.id}`}>
                {track.artist.name}
              </Link>
            </div>
            <button
              type="button"
              className={`icon-btn player__fav${favorite ? " is-active" : ""}`}
              aria-pressed={favorite}
              aria-label={favorite ? "Remover das favoritas" : "Favoritar"}
              onClick={() => void favorites.toggle(track.id)}
            >
              <Icon name={favorite ? "heart-filled" : "heart"} size={20} />
            </button>
          </>
        ) : (
          <p className="player__idle">Escolha uma música para começar.</p>
        )}
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button
            type="button"
            className="icon-btn"
            aria-label="Faixa anterior"
            disabled={!track}
            onClick={player.previous}
          >
            <Icon name="previous" size={22} />
          </button>
          <button
            type="button"
            className={`player__toggle${player.isLoading ? " is-loading" : ""}`}
            aria-label={player.isPlaying ? "Pausar" : "Tocar"}
            disabled={!track}
            onClick={player.togglePlay}
          >
            <Icon name={player.isPlaying ? "pause" : "play"} size={24} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Próxima faixa"
            disabled={!player.hasNext}
            onClick={player.next}
          >
            <Icon name="next" size={22} />
          </button>
        </div>

        <div className="player__progress">
          <span className="player__time">{formatDuration(shown)}</span>
          <input
            type="range"
            className="range"
            min={0}
            max={total > 0 ? total : 1}
            step={0.1}
            value={shown}
            disabled={!track}
            aria-label="Progresso da música"
            aria-valuetext={`${formatDuration(shown)} de ${formatDuration(total)}`}
            style={fill(progress)}
            onChange={(event) => player.seek(Number(event.target.value))}
          />
          <span className="player__time">{formatDuration(total)}</span>
        </div>

        {player.error && (
          <div className="player__error" role="alert">
            <span>{player.error}</span>
            <button type="button" onClick={player.togglePlay}>
              Tentar de novo
            </button>
          </div>
        )}
      </div>

      <div className="player__volume">
        <button
          type="button"
          className="icon-btn"
          aria-label={player.muted ? "Ativar o som" : "Silenciar"}
          onClick={player.toggleMute}
        >
          <Icon name={volumeShown === 0 ? "volume-muted" : "volume"} size={20} />
        </button>
        <input
          type="range"
          className="range"
          min={0}
          max={1}
          step={0.01}
          value={volumeShown}
          aria-label="Volume"
          style={fill(volumeShown * 100)}
          onChange={(event) => player.setVolume(Number(event.target.value))}
        />
      </div>
    </footer>
  );
}
