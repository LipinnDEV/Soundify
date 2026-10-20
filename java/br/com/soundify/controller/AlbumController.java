package br.com.soundify.controller;

import br.com.soundify.dto.AlbumResponse;
import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.service.AlbumService;
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
@RequestMapping("/api/albums")
@Tag(name = "Catálogo: álbuns", description = "Leitura pública de álbuns")
public class AlbumController {

    private final AlbumService albumService;
    private final TrackService trackService;

    public AlbumController(AlbumService albumService, TrackService trackService) {
        this.albumService = albumService;
        this.trackService = trackService;
    }

    @Operation(summary = "Lista e pesquisa álbuns por título ou artista (paginado)")
    @GetMapping
    public PageResponse<AlbumResponse> list(@RequestParam(required = false) String q,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return albumService.list(q, page, size);
    }

    @Operation(summary = "Álbuns em destaque (seleção de demonstração, sem estatísticas reais)")
    @GetMapping("/featured")
    public List<AlbumResponse> featured() {
        return albumService.featured();
    }

    @Operation(summary = "Consulta um álbum pelo ID")
    @GetMapping("/{id}")
    public AlbumResponse get(@PathVariable Long id) {
        return albumService.get(id);
    }

    @Operation(summary = "Faixas de um álbum, na ordem do disco")
    @GetMapping("/{id}/tracks")
    public List<TrackResponse> tracks(@PathVariable Long id) {
        return trackService.byAlbum(id);
    }
}
