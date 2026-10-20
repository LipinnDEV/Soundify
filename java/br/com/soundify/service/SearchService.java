package br.com.soundify.service;

import br.com.soundify.dto.SearchResponse;
import br.com.soundify.mapper.CatalogMapper;
import br.com.soundify.repository.AlbumRepository;
import br.com.soundify.repository.ArtistRepository;
import br.com.soundify.repository.TrackRepository;
import br.com.soundify.util.Paging;
import br.com.soundify.util.Texts;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Busca global: músicas (por título), artistas (por nome) e álbuns (por título ou artista). */
@Service
@Transactional(readOnly = true)
public class SearchService {

    private static final int MAX_PER_GROUP = 20;

    private final TrackRepository tracks;
    private final ArtistRepository artists;
    private final AlbumRepository albums;

    public SearchService(TrackRepository tracks, ArtistRepository artists, AlbumRepository albums) {
        this.tracks = tracks;
        this.artists = artists;
        this.albums = albums;
    }

    public SearchResponse search(String q, int limit) {
        String pattern = Texts.likePattern(q);
        if (pattern == null) {
            return new SearchResponse(List.of(), List.of(), List.of());
        }
        int size = Paging.limit(limit, MAX_PER_GROUP);
        return new SearchResponse(
                tracks.search(pattern, null, Paging.of(0, size, Sort.by("title"))).getContent().stream()
                        .map(CatalogMapper::toTrackResponse).toList(),
                artists.search(pattern, Paging.of(0, size, Sort.by("name"))).getContent().stream()
                        .map(CatalogMapper::toArtistResponse).toList(),
                albums.search(pattern, Paging.of(0, size, Sort.by("title"))).getContent().stream()
                        .map(CatalogMapper::toAlbumResponse).toList());
    }
}
