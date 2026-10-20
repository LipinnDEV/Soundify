package br.com.soundify.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Evento enviado pelo player depois que a música realmente começou a tocar. */
public record RecordPlayRequest(
        @NotNull(message = "Informe a música") Long trackId,
        @NotNull(message = "Informe quantos segundos foram ouvidos")
        @Min(value = 0, message = "O tempo ouvido não pode ser negativo")
        Integer listenedSeconds) {
}
