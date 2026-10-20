package br.com.soundify.dto;

public record ArtistResponse(Long id, String name, String bio, String imageUrl, boolean featured) {
}
