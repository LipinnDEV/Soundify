package br.com.soundify.dto;

import jakarta.validation.constraints.NotNull;

public record AddTrackRequest(@NotNull(message = "Informe a música") Long trackId) {
}
