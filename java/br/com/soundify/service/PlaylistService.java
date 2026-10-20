package br.com.soundify.service;

import br.com.soundify.dto.PlaylistDetailResponse;
import br.com.soundify.dto.PlaylistRequest;
import br.com.soundify.dto.PlaylistSummaryResponse;
import br.com.soundify.entity.Playlist;
import br.com.soundify.entity.PlaylistTrack;
import br.com.soundify.entity.Track;
import br.com.soundify.exception.BusinessRuleException;
import br.com.soundify.exception.ConflictException;
import br.com.soundify.exception.ForbiddenOperationException;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.PlaylistMapper;
import br.com.soundify.repository.PlaylistRepository;
import br.com.soundify.repository.PlaylistTrackRepository;
import br.com.soundify.repository.TrackRepository;
import br.com.soundify.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Regras de playlists. Toda operação passa por {@link #findOwned}: só o dono enxerga e altera a playlist.
 */
@Service
@Transactional(readOnly = true)
public class PlaylistService {

    private final PlaylistRepository playlists;
    private final PlaylistTrackRepository items;
    private final TrackRepository tracks;
    private final UserRepository users;

    public PlaylistService(PlaylistRepository playlists, PlaylistTrackRepository items,
                           TrackRepository tracks, UserRepository users) {
        this.playlists = playlists;
        this.items = items;
        this.tracks = tracks;
        this.users = users;
    }

    /** Playlists do usuário com quantidade de músicas e duração total. */
    public List<PlaylistSummaryResponse> listMine(Long userId) {
        Map<Long, long[]> stats = new HashMap<>();
        for (Object[] row : items.summarizeByOwner(userId)) {
            stats.put(((Number) row[0]).longValue(),
                    new long[]{((Number) row[1]).longValue(), ((Number) row[2]).longValue()});
        }
        return playlists.findByOwnerIdOrderByUpdatedAtDesc(userId).stream()
                .map(playlist -> {
                    long[] s = stats.getOrDefault(playlist.getId(), new long[]{0, 0});
                    return PlaylistMapper.toSummary(playlist, s[0], s[1]);
                })
                .toList();
    }

    public PlaylistDetailResponse get(Long userId, Long playlistId) {
        return detail(findOwned(userId, playlistId));
    }

    @Transactional
    public PlaylistDetailResponse create(Long userId, PlaylistRequest request) {
        Playlist playlist = playlists.save(
                new Playlist(request.name().trim(), clean(request.description()), users.getReferenceById(userId)));
        return PlaylistMapper.toDetail(playlist, List.of());
    }

    @Transactional
    public PlaylistDetailResponse update(Long userId, Long playlistId, PlaylistRequest request) {
        Playlist playlist = findOwned(userId, playlistId);
        playlist.setName(request.name().trim());
        playlist.setDescription(clean(request.description()));
        playlist.touch();
        return detail(playlist);
    }

    /** Os itens da playlist são removidos pelo banco (ON DELETE CASCADE). */
    @Transactional
    public void delete(Long userId, Long playlistId) {
        playlists.delete(findOwned(userId, playlistId));
    }

    /** Adiciona a faixa no fim da playlist. A mesma faixa não pode aparecer duas vezes. */
    @Transactional
    public PlaylistDetailResponse addTrack(Long userId, Long playlistId, Long trackId) {
        Playlist playlist = findOwned(userId, playlistId);
        Track track = tracks.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Música não encontrada."));
        if (items.existsByPlaylistIdAndTrackId(playlistId, trackId)) {
            throw new ConflictException("Esta música já está na playlist.");
        }
        Integer maxOrder = items.findMaxSortOrder(playlistId);
        items.save(new PlaylistTrack(playlist, track, maxOrder == null ? 0 : maxOrder + 1));
        playlist.touch();
        return detail(playlist);
    }

    /** Remove a faixa e renumera as demais para a ordem continuar 0, 1, 2... */
    @Transactional
    public PlaylistDetailResponse removeTrack(Long userId, Long playlistId, Long trackId) {
        Playlist playlist = findOwned(userId, playlistId);
        PlaylistTrack item = items.findByPlaylistIdAndTrackId(playlistId, trackId)
                .orElseThrow(() -> new ResourceNotFoundException("A música não está nesta playlist."));
        items.delete(item);
        List<PlaylistTrack> remaining = items.findByPlaylistIdOrderBySortOrderAsc(playlistId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setSortOrder(i);
        }
        playlist.touch();
        return PlaylistMapper.toDetail(playlist, remaining);
    }

    /** Reordena: recebe todos os IDs de faixa na nova ordem e confere se batem com os da playlist. */
    @Transactional
    public PlaylistDetailResponse reorder(Long userId, Long playlistId, List<Long> trackIds) {
        Playlist playlist = findOwned(userId, playlistId);
        List<PlaylistTrack> current = items.findByPlaylistIdOrderBySortOrderAsc(playlistId);

        Map<Long, PlaylistTrack> byTrackId = new HashMap<>();
        for (PlaylistTrack item : current) {
            byTrackId.put(item.getTrack().getId(), item);
        }
        Set<Long> requested = new HashSet<>(trackIds);
        if (trackIds.stream().anyMatch(Objects::isNull) || trackIds.size() != current.size()
                || requested.size() != trackIds.size() || !requested.equals(byTrackId.keySet())) {
            throw new BusinessRuleException("A nova ordem deve conter exatamente as músicas da playlist, sem repetições.");
        }

        List<PlaylistTrack> ordered = new ArrayList<>();
        for (int i = 0; i < trackIds.size(); i++) {
            PlaylistTrack item = byTrackId.get(trackIds.get(i));
            item.setSortOrder(i);
            ordered.add(item);
        }
        playlist.touch();
        return PlaylistMapper.toDetail(playlist, ordered);
    }

    /** Busca a playlist e confirma que pertence ao usuário (404 se não existe, 403 se é de outra pessoa). */
    private Playlist findOwned(Long userId, Long playlistId) {
        Playlist playlist = playlists.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist não encontrada."));
        if (!playlist.getOwner().getId().equals(userId)) {
            throw new ForbiddenOperationException("Você não tem permissão para acessar esta playlist.");
        }
        return playlist;
    }

    private PlaylistDetailResponse detail(Playlist playlist) {
        return PlaylistMapper.toDetail(playlist, items.findByPlaylistIdOrderBySortOrderAsc(playlist.getId()));
    }

    private static String clean(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }
}
