package br.com.soundify.dto;

/** Resposta de login/cadastro: o token JWT (enviado depois no cabeçalho Authorization) e o usuário. */
public record AuthResponse(String token, String tokenType, long expiresInSeconds, UserResponse user) {
}
