package br.com.soundify.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

/** Propriedades próprias da aplicação (prefixo "app" no application.yml). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(@DefaultValue Jwt jwt, @DefaultValue Cors cors, @DefaultValue History history) {

    /** Segredo de assinatura do JWT (mín. 32 caracteres) e tempo de vida do token. */
    public record Jwt(String secret, @DefaultValue("120") long expirationMinutes) {
    }

    /** Origens do frontend autorizadas a chamar a API (CORS). */
    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) {
    }

    /** Regras para registrar uma reprodução no histórico. */
    public record History(@DefaultValue("3") int minListenedSeconds, @DefaultValue("10") int dedupeWindowSeconds) {
    }
}
