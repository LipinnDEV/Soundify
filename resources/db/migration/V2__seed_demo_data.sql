-- Dados de demonstração (FICTÍCIOS) do Soundify.
-- Gerado por tools/generate_demo_media.py: artistas, álbuns e faixas são inventados e os
-- áudios (MP3) foram sintetizados de forma procedural, sem direitos autorais de terceiros.

INSERT INTO artists (id, name, bio, image_url, featured, created_at) VALUES
(1, 'Neon Harbor', 'Dupla fictícia de synthwave: arpejos analógicos, baixos pulsantes e bateria eletrônica.', '/media/artists/neon-harbor.svg', TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(2, 'Lua Cinza', 'Projeto fictício de lo-fi com piano elétrico, chuva e chiado de vinil.', '/media/artists/lua-cinza.svg', TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(3, 'Quartz Trio', 'Trio fictício de jazz: baixo caminhante, piano e escovinhas em andamento swingado.', '/media/artists/quartz-trio.svg', TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(4, 'Atlas Pulse', 'Produtor fictício de música eletrônica dançante, com graves que respiram.', '/media/artists/atlas-pulse.svg', TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(5, 'Vento Sul', 'Cantautor fictício de violão de aço, estrada de terra e fim de tarde.', '/media/artists/vento-sul.svg', FALSE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(6, 'Elias Kern', 'Pianista fictício de noturnos curtos e valsas românticas.', '/media/artists/elias-kern.svg', FALSE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(7, 'Distorção Livre', 'Banda fictícia de rock de garagem: guitarras sujas e bateria sem frescura.', '/media/artists/distorcao-livre.svg', FALSE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY)),
(8, 'Aurora Drift', 'Projeto fictício de ambient: camadas lentas de sintetizador e sinos distantes.', '/media/artists/aurora-drift.svg', TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY));

INSERT INTO albums (id, title, artist_id, cover_url, release_year, featured, created_at) VALUES
(1, 'Midnight Grid', 1, '/media/covers/midnight-grid.svg', 2024, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY)),
(2, 'Chuva de Domingo', 2, '/media/covers/chuva-de-domingo.svg', 2023, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY)),
(3, 'Blue Hour Sessions', 3, '/media/covers/blue-hour-sessions.svg', 2022, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 9 DAY)),
(4, 'Orbital', 4, '/media/covers/orbital.svg', 2025, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY)),
(5, 'Estrada de Terra', 5, '/media/covers/estrada-de-terra.svg', 2021, FALSE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 14 DAY)),
(6, 'Noturnos Curtos', 6, '/media/covers/noturnos-curtos.svg', 2020, FALSE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 20 DAY)),
(7, 'Garagem 77', 7, '/media/covers/garagem-77.svg', 2024, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY)),
(8, 'Horizonte Lento', 8, '/media/covers/horizonte-lento.svg', 2023, TRUE, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY));

INSERT INTO tracks (id, title, artist_id, album_id, track_number, duration_seconds, genre, cover_url, audio_url, created_at) VALUES
(1, 'Neon Drive', 1, 1, 1, 17, 'Synthwave', '/media/covers/midnight-grid.svg', '/media/audio/neon-drive.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 51 HOUR)),
(2, 'Chrome Skyline', 1, 1, 2, 20, 'Synthwave', '/media/covers/midnight-grid.svg', '/media/audio/chrome-skyline.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 50 HOUR)),
(3, 'Last Arcade', 1, 1, 3, 16, 'Synthwave', '/media/covers/midnight-grid.svg', '/media/audio/last-arcade.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 49 HOUR)),
(4, 'Café com Vinil', 2, 2, 1, 20, 'Lo-fi', '/media/covers/chuva-de-domingo.svg', '/media/audio/cafe-com-vinil.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 123 HOUR)),
(5, 'Janela Aberta', 2, 2, 2, 18, 'Lo-fi', '/media/covers/chuva-de-domingo.svg', '/media/audio/janela-aberta.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 122 HOUR)),
(6, 'Sono Leve', 2, 2, 3, 18, 'Lo-fi', '/media/covers/chuva-de-domingo.svg', '/media/audio/sono-leve.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 121 HOUR)),
(7, 'Blue Hour', 3, 3, 1, 18, 'Jazz', '/media/covers/blue-hour-sessions.svg', '/media/audio/blue-hour.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 219 HOUR)),
(8, 'Walking Home', 3, 3, 2, 16, 'Jazz', '/media/covers/blue-hour-sessions.svg', '/media/audio/walking-home.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 218 HOUR)),
(9, 'Fumaça e Veludo', 3, 3, 3, 20, 'Jazz', '/media/covers/blue-hour-sessions.svg', '/media/audio/fumaca-e-veludo.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 217 HOUR)),
(10, 'Orbital', 4, 4, 1, 16, 'Eletrônica', '/media/covers/orbital.svg', '/media/audio/orbital.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 27 HOUR)),
(11, 'Gravity Well', 4, 4, 2, 16, 'Eletrônica', '/media/covers/orbital.svg', '/media/audio/gravity-well.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 26 HOUR)),
(12, 'Poeira do Caminho', 5, 5, 1, 21, 'Acústico', '/media/covers/estrada-de-terra.svg', '/media/audio/poeira-do-caminho.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 339 HOUR)),
(13, 'Sol na Serra', 5, 5, 2, 17, 'Acústico', '/media/covers/estrada-de-terra.svg', '/media/audio/sol-na-serra.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 338 HOUR)),
(14, 'Prelúdio em Lá', 6, 6, 1, 20, 'Clássica', '/media/covers/noturnos-curtos.svg', '/media/audio/preludio-em-la.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 483 HOUR)),
(15, 'Valsa das Horas', 6, 6, 2, 17, 'Clássica', '/media/covers/noturnos-curtos.svg', '/media/audio/valsa-das-horas.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 482 HOUR)),
(16, 'Volume Máximo', 7, 7, 1, 18, 'Rock', '/media/covers/garagem-77.svg', '/media/audio/volume-maximo.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 75 HOUR)),
(17, 'Rua Sem Saída', 7, 7, 2, 17, 'Rock', '/media/covers/garagem-77.svg', '/media/audio/rua-sem-saida.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 74 HOUR)),
(18, 'Maré Alta', 8, 8, 1, 21, 'Ambient', '/media/covers/horizonte-lento.svg', '/media/audio/mare-alta.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 147 HOUR)),
(19, 'Nebulosa', 8, 8, 2, 20, 'Ambient', '/media/covers/horizonte-lento.svg', '/media/audio/nebulosa.mp3', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 146 HOUR));
