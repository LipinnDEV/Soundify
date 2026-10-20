package br.com.soundify.controller;

import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
@Tag(name = "Catálogo: músicas", description = "Leitura pública do catálogo de músicas")
public class TrackController {

    private final TrackService trackService;

    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    @Operation(summary = "Lista músicas com paginação, busca por título e filtro por gênero")
    @GetMapping
    public PageResponse<TrackResponse> list(
            @Parameter(description = "Trecho do título") @RequestParam(required = false) String q,
            @Parameter(description = "Gênero exato, ex.: Jazz") @RequestParam(required = false) String genre,
            @Parameter(description = "recent (padrão) ou title") @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return trackService.list(q, genre, sort, page, size);
    }

    @Operation(summary = "Músicas adicionadas mais recentemente")
    @GetMapping("/recent")
    public List<TrackResponse> recent(@RequestParam(defaultValue = "12") int limit) {
        return trackService.recent(limit);
    }

    @Operation(summary = "Consulta uma música pelo ID")
    @GetMapping("/{id}")
    public TrackResponse get(@PathVariable Long id) {
        return trackService.get(id);
    }
}
