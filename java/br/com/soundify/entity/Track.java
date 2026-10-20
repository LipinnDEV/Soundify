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

/**
 * Música do catálogo. {@code audioUrl} aponta para um arquivo de demonstração servido
 * pela própria API em /media/audio (arquivos sintetizados, sem direitos autorais).
 */
@Entity
@Table(name = "tracks")
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @Column(name = "track_number")
    private Integer trackNumber;

    @Column(name = "duration_seconds", nullable = false)
    private int durationSeconds;

    @Column(nullable = false, length = 50)
    private String genre;

    @Column(name = "cover_url", length = 255)
    private String coverUrl;

    @Column(name = "audio_url", nullable = false, length = 255)
    private String audioUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Track() {
    }

    public Track(String title, Artist artist, Album album, int durationSeconds,
                 String genre, String coverUrl, String audioUrl) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.durationSeconds = durationSeconds;
        this.genre = genre;
        this.coverUrl = coverUrl;
        this.audioUrl = audioUrl;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }

    public Artist getArtist() { return artist; }

    public Album getAlbum() { return album; }

    public Integer getTrackNumber() { return trackNumber; }

    public int getDurationSeconds() { return durationSeconds; }

    public String getGenre() { return genre; }

    public String getCoverUrl() { return coverUrl; }

    public String getAudioUrl() { return audioUrl; }

    public Instant getCreatedAt() { return createdAt; }
}
