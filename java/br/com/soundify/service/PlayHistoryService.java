package br.com.soundify.service;

import br.com.soundify.config.AppProperties;
import br.com.soundify.dto.HistoryEntryResponse;
import br.com.soundify.dto.RecordPlayRequest;
import br.com.soundify.entity.PlayHistory;
import br.com.soundify.entity.Track;
import br.com.soundify.exception.BusinessRuleException;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.HistoryMapper;
import br.com.soundify.repository.PlayHistoryRepository;
import br.com.soundify.repository.TrackRepository;
import br.com.soundify.repository.UserRepository;
import br.com.soundify.util.Paging;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Histórico de reprodução. Regra principal: só entra no histórico quem realmente ouviu.
 * O player só avisa a API depois de a música estar tocando (ver PlayerContext no frontend), e a API
 * confere de novo o tempo ouvido, então um clique que não chegou a tocar nunca vira registro.
 */
@Service
@Transactional(readOnly = true)
public class PlayHistoryService {

    private final PlayHistoryRepository history;
    private final TrackRepository tracks;
    private final UserRepository users;
    private final AppProperties properties;

    public PlayHistoryService(PlayHistoryRepository history, TrackRepository tracks,
                              UserRepository users, AppProperties properties) {
        this.history = history;
        this.tracks = tracks;
        this.users = users;
        this.properties = properties;
    }

    @Transactional
    public void record(Long userId, RecordPlayRequest request) {
        AppProperties.History rules = properties.history();
        if (request.listenedSeconds() < rules.minListenedSeconds()) {
            throw new BusinessRuleException("A reprodução ainda não começou de fato: o histórico não foi atualizado.");
        }
        Track track = tracks.findById(request.trackId())
                .orElseThrow(() -> new ResourceNotFoundException("Música não encontrada."));

        Instant windowStart = Instant.now().minusSeconds(rules.dedupeWindowSeconds());
        if (history.existsByUserIdAndTrackIdAndPlayedAtAfter(userId, track.getId(), windowStart)) {
            return; // evento repetido (reenvio, duplo disparo): mantém um único registro
        }
        history.save(new PlayHistory(users.getReferenceById(userId), track));
    }

    public List<HistoryEntryResponse> recent(Long userId, int limit) {
        int size = Paging.limit(limit, Paging.MAX_PAGE_SIZE);
        return history.findByUserIdOrderByPlayedAtDescIdDesc(userId, PageRequest.of(0, size)).stream()
                .map(HistoryMapper::toResponse)
                .toList();
    }
}
