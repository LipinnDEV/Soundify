package br.com.soundify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** Item de uma playlist: liga uma faixa à playlist e guarda a posição (sortOrder, a partir de 0). */
@Entity
@Table(name = "playlist_tracks")
public class PlaylistTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    protected PlaylistTrack() {
    }

    public PlaylistTrack(Playlist playlist, Track track, int sortOrder) {
        this.playlist = playlist;
        this.track = track;
        this.sortOrder = sortOrder;
    }

    @PrePersist
    void onCreate() {
        this.addedAt = Instant.now();
    }

    public Long getId() { return id; }

    public Playlist getPlaylist() { return playlist; }

    public Track getTrack() { return track; }

    public int getSortOrder() { return sortOrder; }

    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getAddedAt() { return addedAt; }
}
