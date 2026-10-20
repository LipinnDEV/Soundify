package br.com.soundify.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/** Resposta paginada com formato próprio e estável (página começa em 0). */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements,
                              int totalPages, boolean first, boolean last) {

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
