package br.com.soundify.mapper;

import br.com.soundify.dto.PlaylistDetailResponse;
import br.com.soundify.dto.PlaylistSummaryResponse;
import br.com.soundify.dto.PlaylistTrackResponse;
import br.com.soundify.entity.Playlist;
import br.com.soundify.entity.PlaylistTrack;

import java.util.ArrayList;
import java.util.List;

public final class PlaylistMapper {

    private PlaylistMapper() {
    }

    public static PlaylistSummaryResponse toSummary(Playlist playlist, long trackCount, long totalDurationSeconds) {
        return new PlaylistSummaryResponse(playlist.getId(), playlist.getName(), playlist.getDescription(),
                trackCount, totalDurationSeconds, playlist.getCreatedAt(), playlist.getUpdatedAt());
    }

    /** Monta o detalhe a partir dos itens já ordenados; quantidade e duração total saem da própria lista. */
    public static PlaylistDetailResponse toDetail(Playlist playlist, List<PlaylistTrack> items) {
        List<PlaylistTrackResponse> tracks = new ArrayList<>();
        long totalSeconds = 0;
        for (int i = 0; i < items.size(); i++) {
            PlaylistTrack item = items.get(i);
            totalSeconds += item.getTrack().getDurationSeconds();
            tracks.add(new PlaylistTrackResponse(i, item.getAddedAt(), CatalogMapper.toTrackResponse(item.getTrack())));
        }
        return new PlaylistDetailResponse(playlist.getId(), playlist.getName(), playlist.getDescription(),
                items.size(), totalSeconds, playlist.getCreatedAt(), playlist.getUpdatedAt(), tracks);
    }
}
