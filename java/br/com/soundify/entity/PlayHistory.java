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

/** Registro de uma reprodução que realmente aconteceu (ver PlayHistoryService). */
@Entity
@Table(name = "play_history")
public class PlayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "played_at", nullable = false, updatable = false)
    private Instant playedAt;

    protected PlayHistory() {
    }

    public PlayHistory(User user, Track track) {
        this.user = user;
        this.track = track;
    }

    @PrePersist
    void onCreate() {
        this.playedAt = Instant.now();
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public Track getTrack() { return track; }

    public Instant getPlayedAt() { return playedAt; }
}
