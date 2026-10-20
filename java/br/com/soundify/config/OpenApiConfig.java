package br.com.soundify.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Metadados da documentação Swagger e o esquema "Bearer JWT" usado no botão Authorize. */
@Configuration
public class OpenApiConfig {

    public static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI soundifyOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Soundify API")
                        .version("1.0.0")
                        .description("API REST da plataforma de streaming de música Soundify. "
                                + "Faça login em /api/auth/login e informe o token no botão Authorize."))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME,
                        new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
