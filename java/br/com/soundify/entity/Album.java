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

/** Álbum de um artista. */
@Entity
@Table(name = "albums")
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(name = "cover_url", length = 255)
    private String coverUrl;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Album() {
    }

    public Album(String title, Artist artist, String coverUrl, Integer releaseYear, boolean featured) {
        this.title = title;
        this.artist = artist;
        this.coverUrl = coverUrl;
        this.releaseYear = releaseYear;
        this.featured = featured;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }

    public Artist getArtist() { return artist; }

    public String getCoverUrl() { return coverUrl; }

    public Integer getReleaseYear() { return releaseYear; }

    public boolean isFeatured() { return featured; }

    public Instant getCreatedAt() { return createdAt; }
}
