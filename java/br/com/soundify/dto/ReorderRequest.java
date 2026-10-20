package br.com.soundify.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Nova ordem da playlist: todos os IDs de faixa, na ordem desejada. */
public record ReorderRequest(
        @NotEmpty(message = "Informe a nova ordem das músicas")
        List<@NotNull(message = "ID de música inválido") Long> trackIds) {
}
