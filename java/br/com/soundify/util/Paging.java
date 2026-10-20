package br.com.soundify.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Cria Pageable com limites seguros, para a API nunca devolver páginas gigantes. */
public final class Paging {

    public static final int MAX_PAGE_SIZE = 50;

    private Paging() {
    }

    public static Pageable of(int page, int size, Sort sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, sort);
    }

    /** Limita quantidades pedidas em listas simples (ex.: "últimas 12"). */
    public static int limit(int requested, int max) {
        return Math.min(Math.max(requested, 1), max);
    }
}
