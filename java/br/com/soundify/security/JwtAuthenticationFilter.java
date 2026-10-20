package br.com.soundify.security;

import br.com.soundify.service.RevokedTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro executado a cada requisição: lê o cabeçalho "Authorization: Bearer ...", valida o token
 * e, se estiver tudo certo, registra o usuário autenticado no contexto de segurança.
 * Token ausente ou inválido não gera erro aqui: a requisição segue anônima e os endpoints
 * protegidos respondem 401 (ver RestAuthenticationEntryPoint).
 * O token nunca é escrito nos logs.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final AppUserDetailsService userDetailsService;
    private final RevokedTokenService revokedTokenService;

    public JwtAuthenticationFilter(JwtService jwtService, AppUserDetailsService userDetailsService,
                                   RevokedTokenService revokedTokenService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.revokedTokenService = revokedTokenService;
    }

    /** Extrai o token do cabeçalho Authorization; devolve null quando não existe. */
    public static String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            return token.isEmpty() ? null : token;
        }
        return null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            authenticate(token, request);
        }
        filterChain.doFilter(request, response);
    }

    private void authenticate(String token, HttpServletRequest request) {
        try {
            Claims claims = jwtService.parse(token);
            if (revokedTokenService.isRevoked(claims.getId())) {
                log.debug("Requisição com token revogado ignorada");
                return;
            }
            UserPrincipal principal = userDetailsService.loadUserById(Long.valueOf(claims.getSubject()));
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
            log.debug("Token JWT rejeitado ({})", ex.getClass().getSimpleName());
        }
    }
}
