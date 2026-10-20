package br.com.soundify.service;

import br.com.soundify.dto.AlbumResponse;
import br.com.soundify.dto.PageResponse;
import br.com.soundify.entity.Album;
import br.com.soundify.exception.ResourceNotFoundException;
import br.com.soundify.mapper.CatalogMapper;
import br.com.soundify.repository.AlbumRepository;
import br.com.soundify.util.Paging;
import br.com.soundify.util.Texts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AlbumService {

    private final AlbumRepository albums;

    public AlbumService(AlbumRepository albums) {
        this.albums = albums;
    }

    public PageResponse<AlbumResponse> list(String q, int page, int size) {
        Page<Album> result = albums.search(Texts.likePattern(q), Paging.of(page, size, Sort.by("title")));
        return PageResponse.from(result, CatalogMapper::toAlbumResponse);
    }

    public List<AlbumResponse> featured() {
        return albums.findByFeaturedTrueOrderByReleaseYearDescIdDesc().stream()
                .map(CatalogMapper::toAlbumResponse).toList();
    }

    public AlbumResponse get(Long id) {
        return albums.findById(id)
                .map(CatalogMapper::toAlbumResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado."));
    }
}
