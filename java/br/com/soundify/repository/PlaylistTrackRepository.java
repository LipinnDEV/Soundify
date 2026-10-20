package br.com.soundify.repository;

import br.com.soundify.entity.PlaylistTrack;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlaylistTrackRepository extends JpaRepository<PlaylistTrack, Long> {

    /** Itens da playlist na ordem definida pelo usuário, já com faixa, artista e álbum carregados. */
    @EntityGraph(attributePaths = {"track", "track.artist", "track.album"})
    List<PlaylistTrack> findByPlaylistIdOrderBySortOrderAsc(Long playlistId);

    Optional<PlaylistTrack> findByPlaylistIdAndTrackId(Long playlistId, Long trackId);

    boolean existsByPlaylistIdAndTrackId(Long playlistId, Long trackId);

    /** Maior posição usada na playlist (nulo quando ela está vazia). */
    @Query("select max(pt.sortOrder) from PlaylistTrack pt where pt.playlist.id = :playlistId")
    Integer findMaxSortOrder(@Param("playlistId") Long playlistId);

    /**
     * Quantidade de faixas e duração total (segundos) de cada playlist do usuário.
     * Cada linha: [playlistId, quantidade, duração]. Playlists vazias não aparecem.
     */
    @Query("""
            select p.id, count(pt.id), sum(t.durationSeconds)
            from PlaylistTrack pt
            join pt.playlist p
            join pt.track t
            where p.owner.id = :ownerId
            group by p.id
            """)
    List<Object[]> summarizeByOwner(@Param("ownerId") Long ownerId);
}
