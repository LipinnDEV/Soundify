import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PlaylistFormModal } from "../components/PlaylistFormModal";
import { playlistApi } from "../services/api";
import type { PlaylistDetail, PlaylistSummary } from "../types/api";

type SavedCallback = (playlist: PlaylistDetail) => void;

interface FormState {
  mode: "create" | "edit";
  id?: number;
  name?: string;
  description?: string | null;
  onSaved?: SavedCallback;
}

interface PlaylistsContextValue {
  playlists: PlaylistSummary[];
  loading: boolean;
  refresh: () => Promise<void>;
  openCreate: (onSaved?: SavedCallback) => void;
  openEdit: (playlist: { id: number; name: string; description: string | null }, onSaved?: SavedCallback) => void;
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null);

/** Lista de playlists do usuário (barra lateral, menus "adicionar a...") e o formulário de criar/editar. */
export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPlaylists(await playlistApi.list());
    } catch {
      /* mantém a lista anterior */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openCreate = useCallback((onSaved?: SavedCallback) => setForm({ mode: "create", onSaved }), []);
  const openEdit = useCallback(
    (playlist: { id: number; name: string; description: string | null }, onSaved?: SavedCallback) =>
      setForm({ mode: "edit", id: playlist.id, name: playlist.name, description: playlist.description, onSaved }),
    [],
  );
  const closeForm = useCallback(() => setForm(null), []);

  const submit = useCallback(
    async (name: string, description: string) => {
      if (!form) return;
      const saved =
        form.mode === "edit" && form.id !== undefined
          ? await playlistApi.update(form.id, name, description)
          : await playlistApi.create(name, description);
      await refresh();
      const callback = form.onSaved;
      setForm(null);
      callback?.(saved);
    },
    [form, refresh],
  );

  const value = useMemo(
    () => ({ playlists, loading, refresh, openCreate, openEdit }),
    [playlists, loading, refresh, openCreate, openEdit],
  );

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
      {form && (
        <PlaylistFormModal
          mode={form.mode}
          initialName={form.name ?? ""}
          initialDescription={form.description ?? ""}
          onClose={closeForm}
          onSubmit={submit}
        />
      )}
    </PlaylistsContext.Provider>
  );
}

export function usePlaylists(): PlaylistsContextValue {
  const context = useContext(PlaylistsContext);
  if (!context) throw new Error("usePlaylists deve ser usado dentro de PlaylistsProvider");
  return context;
}
