package br.com.soundify.dto;

import java.util.List;

public record SearchResponse(List<TrackResponse> tracks, List<ArtistResponse> artists, List<AlbumResponse> albums) {
}
