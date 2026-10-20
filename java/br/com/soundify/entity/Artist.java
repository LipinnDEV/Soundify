package br.com.soundify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** Artista do catálogo (somente leitura na API). */
@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(length = 1000)
    private String bio;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Artist() {
    }

    public Artist(String name, String bio, String imageUrl, boolean featured) {
        this.name = name;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.featured = featured;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getBio() { return bio; }

    public String getImageUrl() { return imageUrl; }

    public boolean isFeatured() { return featured; }

    public Instant getCreatedAt() { return createdAt; }
}
