package br.com.soundify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Ponto de entrada da API do Soundify.
 */
@SpringBootApplication
@ConfigurationPropertiesScan // registra as classes @ConfigurationProperties (AppProperties)
@EnableScheduling            // habilita a limpeza periódica de tokens revogados
public class SoundifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SoundifyApplication.class, args);
    }
}
