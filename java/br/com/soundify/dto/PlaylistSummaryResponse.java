package br.com.soundify.dto;

import java.time.Instant;

public record PlaylistSummaryResponse(Long id, String name, String description, long trackCount,
                                      long totalDurationSeconds, Instant createdAt, Instant updatedAt) {
}
