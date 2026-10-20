package br.com.soundify.dto;

public record AlbumResponse(Long id, String title, String coverUrl, Integer releaseYear,
                            boolean featured, ArtistSummary artist) {
}
