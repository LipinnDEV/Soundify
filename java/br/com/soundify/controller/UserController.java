package br.com.soundify.controller;

import br.com.soundify.config.OpenApiConfig;
import br.com.soundify.dto.UpdateProfileRequest;
import br.com.soundify.dto.UserResponse;
import br.com.soundify.security.UserPrincipal;
import br.com.soundify.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuários", description = "Perfil do usuário autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Consulta o perfil do usuário autenticado")
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getProfile(principal.getId());
    }

    @Operation(summary = "Atualiza nome e e-mail do usuário autenticado")
    @PutMapping("/me")
    public UserResponse update(@AuthenticationPrincipal UserPrincipal principal,
                               @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal.getId(), request);
    }
}
