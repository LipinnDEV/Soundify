package br.com.soundify.controller;

import br.com.soundify.config.OpenApiConfig;
import br.com.soundify.dto.PageResponse;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.security.UserPrincipal;
import br.com.soundify.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favoritos", description = "Músicas favoritas do usuário autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @Operation(summary = "Lista as músicas favoritas (mais recentes primeiro)")
    @GetMapping
    public PageResponse<TrackResponse> list(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return favoriteService.list(principal.getId(), page, size);
    }

    @Operation(summary = "IDs das músicas favoritas (para marcar o coração na interface)")
    @GetMapping("/ids")
    public List<Long> ids(@AuthenticationPrincipal UserPrincipal principal) {
        return favoriteService.ids(principal.getId());
    }

    @Operation(summary = "Favorita uma música (idempotente)")
    @PutMapping("/{trackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long trackId) {
        favoriteService.add(principal.getId(), trackId);
    }

    @Operation(summary = "Desfavorita uma música (idempotente)")
    @DeleteMapping("/{trackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long trackId) {
        favoriteService.remove(principal.getId(), trackId);
    }
}
