package br.com.soundify.util;

import java.util.Locale;

/** Pequenas rotinas de texto usadas nas buscas. */
public final class Texts {

    private Texts() {
    }

    /** Remove espaços das pontas e converte para minúsculas; devolve null para texto vazio. */
    public static String normalize(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    /** Monta o padrão do LIKE (%texto%) em minúsculas; null quando não há texto de busca. */
    public static String likePattern(String text) {
        String normalized = normalize(text);
        return normalized == null ? null : "%" + normalized + "%";
    }
}
