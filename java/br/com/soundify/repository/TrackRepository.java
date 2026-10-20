package br.com.soundify.repository;

import br.com.soundify.entity.Track;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {

    @Override
    @EntityGraph(attributePaths = {"artist", "album"})
    Optional<Track> findById(Long id);

    /**
     * Lista paginada com filtros opcionais por título (pattern) e gênero (genre).
     * Parâmetros nulos desligam o respectivo filtro. O join fetch traz artista e álbum juntos.
     */
    @Query(value = """
            select t from Track t join fetch t.artist left join fetch t.album
            where (:pattern is null or lower(t.title) like :pattern)
              and (:genre is null or lower(t.genre) = :genre)
            """,
            countQuery = """
            select count(t) from Track t
            where (:pattern is null or lower(t.title) like :pattern)
              and (:genre is null or lower(t.genre) = :genre)
            """)
    Page<Track> search(@Param("pattern") String pattern, @Param("genre") String genre, Pageable pageable);

    @EntityGraph(attributePaths = {"artist", "album"})
    List<Track> findByArtistIdOrderByTitleAsc(Long artistId);

    @EntityGraph(attributePaths = {"artist", "album"})
    List<Track> findByAlbumIdOrderByTrackNumberAscIdAsc(Long albumId);

    @Query("select distinct t.genre from Track t order by t.genre")
    List<String> findDistinctGenres();
}
