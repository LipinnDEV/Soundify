package br.com.soundify.repository;

import br.com.soundify.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    // O EntityGraph carrega o artista na mesma consulta (evita o problema do N+1).
    @Override
    @EntityGraph(attributePaths = "artist")
    Optional<Album> findById(Long id);

    @EntityGraph(attributePaths = "artist")
    List<Album> findByFeaturedTrueOrderByReleaseYearDescIdDesc();

    @EntityGraph(attributePaths = "artist")
    List<Album> findByArtistIdOrderByReleaseYearDescIdDesc(Long artistId);

    /** Busca pelo título do álbum ou pelo nome do artista. */
    @Query(value = """
            select a from Album a join fetch a.artist ar
            where :pattern is null or lower(a.title) like :pattern or lower(ar.name) like :pattern
            """,
            countQuery = """
            select count(a) from Album a join a.artist ar
            where :pattern is null or lower(a.title) like :pattern or lower(ar.name) like :pattern
            """)
    Page<Album> search(@Param("pattern") String pattern, Pageable pageable);
}
