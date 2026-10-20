package br.com.soundify.dto;

import java.time.Instant;
import java.util.List;

public record PlaylistDetailResponse(Long id, String name, String description, long trackCount,
                                     long totalDurationSeconds, Instant createdAt, Instant updatedAt,
                                     List<PlaylistTrackResponse> tracks) {
}
