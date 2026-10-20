package br.com.soundify.controller;

import br.com.soundify.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@Tag(name = "Catálogo: músicas")
public class GenreController {

    private final TrackService trackService;

    public GenreController(TrackService trackService) {
        this.trackService = trackService;
    }

    @Operation(summary = "Lista os gêneros musicais disponíveis")
    @GetMapping
    public List<String> list() {
        return trackService.genres();
    }
}
