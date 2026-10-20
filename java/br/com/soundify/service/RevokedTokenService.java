package br.com.soundify.service;

import br.com.soundify.entity.RevokedToken;
import br.com.soundify.repository.RevokedTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Lista de tokens revogados (logout). Como o JWT é stateless, a única forma de "invalidar" um
 * token antes de expirar é guardar o identificador dele (jti) e recusá-lo nas próximas requisições.
 */
@Service
public class RevokedTokenService {

    private static final Logger log = LoggerFactory.getLogger(RevokedTokenService.class);

    private final RevokedTokenRepository repository;

    public RevokedTokenService(RevokedTokenRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void revoke(String jti, Instant expiresAt) {
        if (!repository.existsById(jti)) {
            repository.save(new RevokedToken(jti, expiresAt));
        }
    }

    @Transactional(readOnly = true)
    public boolean isRevoked(String jti) {
        return jti != null && repository.existsById(jti);
    }

    /** Remove da lista os tokens que já expirariam sozinhos, para a tabela não crescer sem fim. */
    @Scheduled(fixedDelayString = "PT1H", initialDelayString = "PT1M")
    @Transactional
    public void purgeExpired() {
        int removed = repository.deleteExpired(Instant.now());
        if (removed > 0) {
            log.info("Tokens revogados expirados removidos: {}", removed);
        }
    }
}
