package br.com.soundify.controller;

import br.com.soundify.config.OpenApiConfig;
import br.com.soundify.dto.HistoryEntryResponse;
import br.com.soundify.dto.RecordPlayRequest;
import br.com.soundify.security.UserPrincipal;
import br.com.soundify.service.PlayHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@Tag(name = "Histórico", description = "Histórico de reprodução do usuário autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class HistoryController {

    private final PlayHistoryService historyService;

    public HistoryController(PlayHistoryService historyService) {
        this.historyService = historyService;
    }

    @Operation(summary = "Registra uma reprodução que realmente começou",
            description = "Só é aceito se listenedSeconds atingir o mínimo configurado (padrão: 3 s); "
                    + "caso contrário responde 422 e nada é gravado.")
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void record(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody RecordPlayRequest request) {
        historyService.record(principal.getId(), request);
    }

    @Operation(summary = "Últimas músicas reproduzidas")
    @GetMapping
    public List<HistoryEntryResponse> recent(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestParam(defaultValue = "20") int limit) {
        return historyService.recent(principal.getId(), limit);
    }
}
