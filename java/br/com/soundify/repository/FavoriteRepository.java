package br.com.soundify.repository;

import br.com.soundify.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = {"track", "track.artist", "track.album"})
    Page<Favorite> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndTrackId(Long userId, Long trackId);

    /** Só os IDs: o frontend usa para pintar o coração das músicas já favoritadas. */
    @Query("select f.track.id from Favorite f where f.user.id = :userId")
    List<Long> findTrackIdsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from Favorite f where f.user.id = :userId and f.track.id = :trackId")
    int deleteByUserIdAndTrackId(@Param("userId") Long userId, @Param("trackId") Long trackId);
}
