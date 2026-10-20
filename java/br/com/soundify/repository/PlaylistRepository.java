package br.com.soundify.repository;

import br.com.soundify.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);
}
