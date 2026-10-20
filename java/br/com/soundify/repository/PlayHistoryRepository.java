package br.com.soundify.repository;

import br.com.soundify.entity.PlayHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {

    @EntityGraph(attributePaths = {"track", "track.artist", "track.album"})
    List<PlayHistory> findByUserIdOrderByPlayedAtDescIdDesc(Long userId, Pageable pageable);

    boolean existsByUserIdAndTrackIdAndPlayedAtAfter(Long userId, Long trackId, Instant threshold);
}
