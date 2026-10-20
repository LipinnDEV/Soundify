package br.com.soundify.controller;

import br.com.soundify.config.OpenApiConfig;
import br.com.soundify.dto.AddTrackRequest;
import br.com.soundify.dto.PlaylistDetailResponse;
import br.com.soundify.dto.PlaylistRequest;
import br.com.soundify.dto.PlaylistSummaryResponse;
import br.com.soundify.dto.ReorderRequest;
import br.com.soundify.security.UserPrincipal;
import br.com.soundify.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@Tag(name = "Playlists", description = "Playlists privadas do usuário autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @Operation(summary = "Lista as playlists do usuário (com quantidade de músicas e duração total)")
    @GetMapping
    public List<PlaylistSummaryResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return playlistService.listMine(principal.getId());
    }

    @Operation(summary = "Cria uma playlist")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlaylistDetailResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                         @Valid @RequestBody PlaylistRequest request) {
        return playlistService.create(principal.getId(), request);
    }

    @Operation(summary = "Consulta uma playlist e suas músicas, em ordem")
    @GetMapping("/{id}")
    public PlaylistDetailResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return playlistService.get(principal.getId(), id);
    }

    @Operation(summary = "Edita nome e descrição")
    @PutMapping("/{id}")
    public PlaylistDetailResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id,
                                         @Valid @RequestBody PlaylistRequest request) {
        return playlistService.update(principal.getId(), id, request);
    }

    @Operation(summary = "Exclui a playlist")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        playlistService.delete(principal.getId(), id);
    }

    @Operation(summary = "Adiciona uma música ao fim da playlist")
    @PostMapping("/{id}/tracks")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaylistDetailResponse addTrack(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id,
                                           @Valid @RequestBody AddTrackRequest request) {
        return playlistService.addTrack(principal.getId(), id, request.trackId());
    }

    @Operation(summary = "Remove uma música da playlist")
    @DeleteMapping("/{id}/tracks/{trackId}")
    public PlaylistDetailResponse removeTrack(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long id, @PathVariable Long trackId) {
        return playlistService.removeTrack(principal.getId(), id, trackId);
    }

    @Operation(summary = "Reordena as músicas (envie todos os IDs na nova ordem)")
    @PutMapping("/{id}/tracks/order")
    public PlaylistDetailResponse reorder(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id,
                                          @Valid @RequestBody ReorderRequest request) {
        return playlistService.reorder(principal.getId(), id, request.trackIds());
    }
}
