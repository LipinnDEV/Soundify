-- Esquema inicial do Soundify (MySQL 8), versionado pelo Flyway.
-- Convenções: chaves primárias BIGINT auto incremento, datas em UTC (DATETIME(6)),
-- restrições de integridade nomeadas (uk_ = única, fk_ = chave estrangeira, ck_ = check).

CREATE TABLE users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE artists (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    name       VARCHAR(120)  NOT NULL,
    bio        VARCHAR(1000) NULL,
    image_url  VARCHAR(255)  NULL,
    featured   BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_artists_name UNIQUE (name),
    INDEX idx_artists_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE albums (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(150) NOT NULL,
    artist_id    BIGINT       NOT NULL,
    cover_url    VARCHAR(255) NULL,
    release_year SMALLINT     NULL,
    featured     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_albums_artist FOREIGN KEY (artist_id) REFERENCES artists (id),
    INDEX idx_albums_featured (featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tracks (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    title            VARCHAR(150) NOT NULL,
    artist_id        BIGINT       NOT NULL,
    album_id         BIGINT       NULL,
    track_number     INT          NULL,
    duration_seconds INT          NOT NULL,
    genre            VARCHAR(50)  NOT NULL,
    cover_url        VARCHAR(255) NULL,
    audio_url        VARCHAR(255) NOT NULL,
    created_at       DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tracks_artist FOREIGN KEY (artist_id) REFERENCES artists (id),
    CONSTRAINT fk_tracks_album FOREIGN KEY (album_id) REFERENCES albums (id),
    CONSTRAINT ck_tracks_duration CHECK (duration_seconds > 0),
    INDEX idx_tracks_genre (genre),
    INDEX idx_tracks_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE playlists (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    owner_id    BIGINT       NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_playlists_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_playlists_owner_updated (owner_id, updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Faixas de uma playlist: sort_order define a ordem; a mesma faixa não se repete na playlist.
-- ON DELETE CASCADE: ao excluir a playlist, os itens são removidos pelo próprio banco.
CREATE TABLE playlist_tracks (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    playlist_id BIGINT      NOT NULL,
    track_id    BIGINT      NOT NULL,
    sort_order  INT         NOT NULL,
    added_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_playlist_track UNIQUE (playlist_id, track_id),
    CONSTRAINT fk_pt_playlist FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_track FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
    CONSTRAINT ck_pt_sort_order CHECK (sort_order >= 0),
    INDEX idx_pt_playlist_order (playlist_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE favorites (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    track_id   BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_favorite UNIQUE (user_id, track_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_track FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
    INDEX idx_favorites_user_created (user_id, created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE play_history (
    id        BIGINT      NOT NULL AUTO_INCREMENT,
    user_id   BIGINT      NOT NULL,
    track_id  BIGINT      NOT NULL,
    played_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_track FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
    INDEX idx_history_user_played (user_id, played_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Lista de tokens JWT revogados no logout (identificados pelo claim "jti").
-- Registros expirados são removidos periodicamente pela aplicação.
CREATE TABLE revoked_tokens (
    jti        VARCHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (jti),
    INDEX idx_revoked_expires (expires_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
