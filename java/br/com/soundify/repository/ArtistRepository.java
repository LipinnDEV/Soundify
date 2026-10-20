package br.com.soundify.repository;

import br.com.soundify.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

    List<Artist> findByFeaturedTrueOrderByNameAsc();

    /** {@code pattern} já vem em minúsculas e no formato %texto%; nulo significa "sem filtro". */
    @Query("select a from Artist a where :pattern is null or lower(a.name) like :pattern")
    Page<Artist> search(@Param("pattern") String pattern, Pageable pageable);
}
