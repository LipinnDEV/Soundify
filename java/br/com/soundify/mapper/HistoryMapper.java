package br.com.soundify.mapper;

import br.com.soundify.dto.HistoryEntryResponse;
import br.com.soundify.entity.PlayHistory;

public final class HistoryMapper {

    private HistoryMapper() {
    }

    public static HistoryEntryResponse toResponse(PlayHistory entry) {
        return new HistoryEntryResponse(entry.getId(), entry.getPlayedAt(), CatalogMapper.toTrackResponse(entry.getTrack()));
    }
}
