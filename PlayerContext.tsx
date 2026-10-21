import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { historyApi } from "../services/api";
import type { Track } from "../types/api";

const VOLUME_KEY = "soundify.volume";
/** Segundos de reprodução real antes de avisar a API (o backend confere o mesmo mínimo: app.history.min-listened-seconds). */
const MIN_LISTEN_SECONDS = 3;

interface PlayerContextValue {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  muted: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

interface PlayerProgressValue {
  currentTime: number;
  duration: number;
}

// O tempo atual muda ~4x por segundo; fica em um contexto separado para não re-renderizar as listas toda hora.
const PlayerContext = createContext<PlayerContextValue | null>(null);
const ProgressContext = createContext<PlayerProgressValue>({ currentTime: 0, duration: 0 });

function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const value = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.8;
  } catch {
    return 0.8;
  }
}

/**
 * Player global: um único elemento de áudio para o app inteiro, com fila de reprodução.
 * Fica dentro do layout autenticado, então o áudio para sozinho quando o usuário sai da conta.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (audioRef.current === null && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
  }

  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(readStoredVolume);
  const [muted, setMuted] = useState(false);

  // Espelhos em ref: os ouvintes de eventos do <audio> precisam do valor atual, não do capturado na criação.
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(-1);
  const listenedRef = useRef(0); // segundos efetivamente ouvidos da faixa atual
  const lastTimeRef = useRef(0);
  const recordedRef = useRef(false); // já avisamos o histórico para esta faixa?

  const loadTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    listenedRef.current = 0;
    lastTimeRef.current = 0;
    recordedRef.current = false;
    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(track.durationSeconds);
    audio.src = track.audioUrl;
    audio.play().catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === "AbortError") return; // troca rápida de faixa
      setIsPlaying(false);
      setIsLoading(false);
      setError("Não foi possível reproduzir esta faixa.");
    });
  }, []);

  const goTo = useCallback(
    (nextQueue: Track[], nextIndex: number) => {
      const track = nextQueue[nextIndex];
      if (!track) return;
      queueRef.current = nextQueue;
      indexRef.current = nextIndex;
      setQueue(nextQueue);
      setIndex(nextIndex);
      loadTrack(track);
    },
    [loadTrack],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      // Soma só avanços contínuos (< 1,5 s entre eventos): pular para frente na barra não conta como "ouvido".
      const delta = time - lastTimeRef.current;
      if (delta > 0 && delta < 1.5) listenedRef.current += delta;
      lastTimeRef.current = time;
      // Histórico: só depois de MIN_LISTEN_SECONDS de reprodução real, e uma única vez por faixa tocada.
      if (!recordedRef.current && listenedRef.current >= MIN_LISTEN_SECONDS) {
        recordedRef.current = true;
        const track = queueRef.current[indexRef.current];
        if (track) {
          historyApi.record(track.id, Math.floor(listenedRef.current)).catch(() => undefined);
        }
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      const nextIndex = indexRef.current + 1;
      if (nextIndex < queueRef.current.length) {
        goTo(queueRef.current, nextIndex); // reprodução contínua: segue para a próxima da fila
      } else {
        setCurrentTime(0);
      }
    };
    const onError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setError("Não foi possível carregar o áudio desta faixa.");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [goTo]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* ignora */
    }
  }, [volume]);

  // Ao sair do layout (logout), para o áudio e libera o recurso.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    };
  }, []);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => goTo(tracks, startIndex), [goTo]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const track = queueRef.current[indexRef.current];
    if (!audio || !track) return;
    if (!audio.src || audio.error) {
      loadTrack(track); // tenta de novo depois de um erro
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => setError("Não foi possível reproduzir esta faixa."));
    } else {
      audio.pause();
    }
  }, [loadTrack]);

  const next = useCallback(() => {
    const nextIndex = indexRef.current + 1;
    if (nextIndex < queueRef.current.length) goTo(queueRef.current, nextIndex);
  }, [goTo]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Padrão dos players: depois de 3 s volta ao início da faixa; antes disso, vai para a anterior.
    if (audio.currentTime > 3 || indexRef.current <= 0) {
      audio.currentTime = 0;
      lastTimeRef.current = 0;
      setCurrentTime(0);
      return;
    }
    goTo(queueRef.current, indexRef.current - 1);
  }, [goTo]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    lastTimeRef.current = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
    if (value > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => setMuted((current) => !current), []);

  const currentTrack = index >= 0 && index < queue.length ? queue[index] : null;

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentTrack,
      isPlaying,
      isLoading,
      error,
      volume,
      muted,
      hasNext: index + 1 < queue.length,
      hasPrevious: index > 0,
      playQueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
    }),
    [queue, currentTrack, isPlaying, isLoading, error, volume, muted, index, playQueue, togglePlay, next, previous, seek, setVolume, toggleMute],
  );
  const progress = useMemo(() => ({ currentTime, duration }), [currentTime, duration]);

  return (
    <PlayerContext.Provider value={value}>
      <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer deve ser usado dentro de PlayerProvider");
  return context;
}

export function usePlayerProgress(): PlayerProgressValue {
  return useContext(ProgressContext);
}
