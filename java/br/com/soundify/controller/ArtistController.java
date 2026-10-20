package br.com.soundify.controller;

import br.com.soundify.dto.AlbumResponse;
import br.com.soundify.dto.ArtistResponse;
import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.service.ArtistService;
import br.com.soundify.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@Tag(name = "Catálogo: artistas", description = "Leitura pública de artistas")
public class ArtistController {

    private final ArtistService artistService;
    private final TrackService trackService;

    public ArtistController(ArtistService artistService, TrackService trackService) {
        this.artistService = artistService;
        this.trackService = trackService;
    }

    @Operation(summary = "Lista e pesquisa artistas por nome (paginado)")
    @GetMapping
    public PageResponse<ArtistResponse> list(@RequestParam(required = false) String q,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return artistService.list(q, page, size);
    }

    @Operation(summary = "Artistas em destaque (seleção de demonstração)")
    @GetMapping("/featured")
    public List<ArtistResponse> featured() {
        return artistService.featured();
    }

    @Operation(summary = "Consulta um artista pelo ID")
    @GetMapping("/{id}")
    public ArtistResponse get(@PathVariable Long id) {
        return artistService.get(id);
    }

    @Operation(summary = "Músicas de um artista")
    @GetMapping("/{id}/tracks")
    public List<TrackResponse> tracks(@PathVariable Long id) {
        return trackService.byArtist(id);
    }

    @Operation(summary = "Álbuns de um artista")
    @GetMapping("/{id}/albums")
    public List<AlbumResponse> albums(@PathVariable Long id) {
        return artistService.albumsOf(id);
    }
}
