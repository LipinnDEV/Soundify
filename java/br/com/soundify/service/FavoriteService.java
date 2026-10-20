package br.com.soundify.service;

import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.entity.Favorite;
import br.com.soundify.entity.Track;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.CatalogMapper;
import br.com.soundify.repository.FavoriteRepository;
import br.com.soundify.repository.TrackRepository;
import br.com.soundify.repository.UserRepository;
import br.com.soundify.util.Paging;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favorites;
    private final TrackRepository tracks;
    private final UserRepository users;

    public FavoriteService(FavoriteRepository favorites, TrackRepository tracks, UserRepository users) {
        this.favorites = favorites;
        this.tracks = tracks;
        this.users = users;
    }

    /** Favoritas do usuário, da mais recente para a mais antiga. */
    public PageResponse<TrackResponse> list(Long userId, int page, int size) {
        Page<Favorite> result = favorites.findByUserId(userId,
                Paging.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
        return PageResponse.from(result, favorite -> CatalogMapper.toTrackResponse(favorite.getTrack()));
    }

    public List<Long> ids(Long userId) {
        return favorites.findTrackIdsByUserId(userId);
    }

    /** Idempotente: favoritar duas vezes não gera erro nem duplicata. */
    @Transactional
    public void add(Long userId, Long trackId) {
        if (favorites.existsByUserIdAndTrackId(userId, trackId)) {
            return;
        }
        Track track = tracks.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Música não encontrada."));
        favorites.save(new Favorite(users.getReferenceById(userId), track));
    }

    /** Idempotente: desfavoritar algo que não está favoritado também não gera erro. */
    @Transactional
    public void remove(Long userId, Long trackId) {
        favorites.deleteByUserIdAndTrackId(userId, trackId);
    }
}
