package br.com.soundify.dto;

import java.time.Instant;

public record TrackResponse(Long id, String title, int durationSeconds, String genre, String coverUrl,
                            String audioUrl, Integer trackNumber, Instant createdAt,
                            ArtistSummary artist, AlbumSummary album) {
}
