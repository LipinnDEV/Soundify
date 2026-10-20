package br.com.soundify.service;

import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.entity.Track;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.CatalogMapper;
import br.com.soundify.repository.AlbumRepository;
import br.com.soundify.repository.ArtistRepository;
import br.com.soundify.repository.TrackRepository;
import br.com.soundify.util.Paging;
import br.com.soundify.util.Texts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TrackService {

    private static final Sort NEWEST_FIRST = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
    private static final Sort BY_TITLE = Sort.by(Sort.Order.asc("title"), Sort.Order.asc("id"));

    private final TrackRepository tracks;
    private final ArtistRepository artists;
    private final AlbumRepository albums;

    public TrackService(TrackRepository tracks, ArtistRepository artists, AlbumRepository albums) {
        this.tracks = tracks;
        this.artists = artists;
        this.albums = albums;
    }

    /** Lista paginada, com busca por título (q) e filtro por gênero opcionais. sort: "recent" (padrão) ou "title". */
    public PageResponse<TrackResponse> list(String q, String genre, String sort, int page, int size) {
        Sort order = "title".equalsIgnoreCase(sort) ? BY_TITLE : NEWEST_FIRST;
        Page<Track> result = tracks.search(Texts.likePattern(q), Texts.normalize(genre), Paging.of(page, size, order));
        return PageResponse.from(result, CatalogMapper::toTrackResponse);
    }

    /** Músicas adicionadas mais recentemente (página inicial). */
    public List<TrackResponse> recent(int limit) {
        Page<Track> result = tracks.search(null, null, Paging.of(0, Paging.limit(limit, 24), NEWEST_FIRST));
        return result.getContent().stream().map(CatalogMapper::toTrackResponse).toList();
    }

    public TrackResponse get(Long id) {
        return tracks.findById(id)
                .map(CatalogMapper::toTrackResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Música não encontrada."));
    }

    public List<String> genres() {
        return tracks.findDistinctGenres();
    }

    public List<TrackResponse> byArtist(Long artistId) {
        if (!artists.existsById(artistId)) {
            throw new ResourceNotFoundException("Artista não encontrado.");
        }
        return tracks.findByArtistIdOrderByTitleAsc(artistId).stream().map(CatalogMapper::toTrackResponse).toList();
    }

    public List<TrackResponse> byAlbum(Long albumId) {
        if (!albums.existsById(albumId)) {
            throw new ResourceNotFoundException("Álbum não encontrado.");
        }
        return tracks.findByAlbumIdOrderByTrackNumberAscIdAsc(albumId).stream().map(CatalogMapper::toTrackResponse).toList();
    }
}
