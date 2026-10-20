package br.com.soundify.service;

import br.com.soundify.dto.AuthResponse;
import br.com.soundify.dto.LoginRequest;
import br.com.soundify.dto.RegisterRequest;
import br.com.soundify.entity.User;
import br.com.soundify.exception.ConflictException;
import br.com.soundify.mapper.UserMapper;
import br.com.soundify.repository.UserRepository;
import br.com.soundify.security.JwtService;
import br.com.soundify.security.UserPrincipal;
import br.com.soundify.util.Texts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cadastro, login e logout. */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RevokedTokenService revokedTokenService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       RevokedTokenService revokedTokenService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.revokedTokenService = revokedTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = Texts.normalize(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Já existe uma conta cadastrada com este e-mail.");
        }
        // Só o hash BCrypt vai para o banco; a senha original nunca é armazenada.
        User user = users.save(new User(request.name().trim(), email, passwordEncoder.encode(request.password())));
        return buildResponse(user);
    }

    /** A verificação da senha é feita pelo Spring Security; credenciais erradas lançam AuthenticationException (401). */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(Texts.normalize(request.email()), request.password()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return buildResponse(principal.getUser());
    }

    /** Revoga o token informado. Token inválido ou já expirado não precisa de revogação. */
    public void logout(String token) {
        try {
            Claims claims = jwtService.parse(token);
            revokedTokenService.revoke(claims.getId(), claims.getExpiration().toInstant());
        } catch (JwtException | IllegalArgumentException ex) {
            // nada a revogar
        }
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(), UserMapper.toResponse(user));
    }
}
