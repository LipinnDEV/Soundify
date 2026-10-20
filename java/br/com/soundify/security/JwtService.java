package br.com.soundify.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Gera e valida tokens JWT assinados com HMAC-SHA.
 * O token carrega apenas o ID do usuário ("sub"), o papel e um identificador único ("jti"),
 * usado para revogar o token no logout. Nunca guarda senha nem dados sensíveis.
 */
public class JwtService {

    private static final int MIN_SECRET_BYTES = 32; // 256 bits

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(String secret, Duration expiration) {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET não configurado ou muito curto: defina um segredo com pelo menos 32 caracteres.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expiration = expiration;
    }

    public String generateToken(UserPrincipal principal) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(principal.getId()))
                .claim("role", principal.getUser().getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(key)
                .compact();
    }

    /** Valida assinatura e validade. Lança JwtException se o token for inválido ou estiver expirado. */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getExpirationSeconds() {
        return expiration.toSeconds();
    }
}
