import { useNavigate } from "react-router-dom";
import { PlaylistCard } from "../components/Cards";
import { EmptyState, Loading } from "../components/States";
import { usePlaylists } from "../contexts/PlaylistsContext";

export function LibraryPage() {
  const { playlists, loading, openCreate } = usePlaylists();
  const navigate = useNavigate();
  const create = () => openCreate((created) => navigate(`/playlists/${created.id}`));

  return (
    <div className="page page--top">
      <div className="page__bar">
        <h1 className="page__title">Sua biblioteca</h1>
        <button type="button" className="btn btn--primary" onClick={create}>
          Nova playlist
        </button>
      </div>
      {loading && playlists.length === 0 && <Loading />}
      {!loading && playlists.length === 0 && (
        <EmptyState
          title="Nenhuma playlist ainda"
          text="Crie uma playlist e adicione músicas com o botão + de cada faixa."
        />
      )}
      <div className="grid">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
