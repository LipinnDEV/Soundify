package br.com.soundify.mapper;

import br.com.soundify.dto.AlbumResponse;
import br.com.soundify.dto.AlbumSummary;
import br.com.soundify.dto.ArtistResponse;
import br.com.soundify.dto.ArtistSummary;
import br.com.soundify.dto.TrackResponse;
import br.com.soundify.entity.Album;
import br.com.soundify.entity.Artist;
import br.com.soundify.entity.Track;

/** Converte entidades do catálogo em DTOs. Deve ser chamado dentro da transação (relações são lazy). */
public final class CatalogMapper {

    private CatalogMapper() {
    }

    public static ArtistSummary toArtistSummary(Artist artist) {
        return new ArtistSummary(artist.getId(), artist.getName());
    }

    public static ArtistResponse toArtistResponse(Artist artist) {
        return new ArtistResponse(artist.getId(), artist.getName(), artist.getBio(), artist.getImageUrl(), artist.isFeatured());
    }

    public static AlbumResponse toAlbumResponse(Album album) {
        return new AlbumResponse(album.getId(), album.getTitle(), album.getCoverUrl(), album.getReleaseYear(),
                album.isFeatured(), toArtistSummary(album.getArtist()));
    }

    public static TrackResponse toTrackResponse(Track track) {
        AlbumSummary album = track.getAlbum() == null ? null : new AlbumSummary(track.getAlbum().getId(), track.getAlbum().getTitle());
        return new TrackResponse(track.getId(), track.getTitle(), track.getDurationSeconds(), track.getGenre(),
                track.getCoverUrl(), track.getAudioUrl(), track.getTrackNumber(), track.getCreatedAt(),
                toArtistSummary(track.getArtist()), album);
    }
}
