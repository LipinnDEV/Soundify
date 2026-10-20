package br.com.soundify.dto;

import java.time.Instant;

public record HistoryEntryResponse(Long id, Instant playedAt, TrackResponse track) {
}
