package br.com.soundify.service;

import br.com.soundify.dto.AlbumResponse;
import br.com.soundify.dto.ArtistResponse;
import br.com.soundify.dto.PageResponse;
import br.com.soundify.entity.Artist;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.CatalogMapper;
import br.com.soundify.repository.AlbumRepository;
import br.com.soundify.repository.ArtistRepository;
import br.com.soundify.util.Paging;
import br.com.soundify.util.Texts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArtistService {

    private final ArtistRepository artists;
    private final AlbumRepository albums;

    public ArtistService(ArtistRepository artists, AlbumRepository albums) {
        this.artists = artists;
        this.albums = albums;
    }

    public PageResponse<ArtistResponse> list(String q, int page, int size) {
        Page<Artist> result = artists.search(Texts.likePattern(q), Paging.of(page, size, Sort.by("name")));
        return PageResponse.from(result, CatalogMapper::toArtistResponse);
    }

    public List<ArtistResponse> featured() {
        return artists.findByFeaturedTrueOrderByNameAsc().stream().map(CatalogMapper::toArtistResponse).toList();
    }

    public ArtistResponse get(Long id) {
        return artists.findById(id)
                .map(CatalogMapper::toArtistResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado."));
    }

    public List<AlbumResponse> albumsOf(Long artistId) {
        if (!artists.existsById(artistId)) {
            throw new ResourceNotFoundException("Artista não encontrado.");
        }
        return albums.findByArtistIdOrderByReleaseYearDescIdDesc(artistId).stream()
                .map(CatalogMapper::toAlbumResponse).toList();
    }
}
