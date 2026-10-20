package br.com.soundify.dto;

import java.time.Instant;

public record PlaylistTrackResponse(int position, Instant addedAt, TrackResponse track) {
}
