package br.com.soundify.dto;

import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

/** Formato único de erro devolvido pela API. */
public record ApiError(Instant timestamp, int status, String error, String message,
                       String path, List<FieldViolation> fieldErrors) {

    public record FieldViolation(String field, String message) {
    }

    public static ApiError of(HttpStatus status, String message, String path) {
        return of(status, message, path, List.of());
    }

    public static ApiError of(HttpStatus status, String message, String path, List<FieldViolation> fieldErrors) {
        return new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, path, fieldErrors);
    }
}
