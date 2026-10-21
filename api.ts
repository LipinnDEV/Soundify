// Tipos que espelham os DTOs devolvidos pela API (pacote br.com.soundify.dto no backend).

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserProfile;
}

export interface ArtistSummary {
  id: number;
  name: string;
}

export interface AlbumSummary {
  id: number;
  title: string;
}

export interface Track {
  id: number;
  title: string;
  durationSeconds: number;
  genre: string;
  coverUrl: string | null;
  audioUrl: string;
  trackNumber: number | null;
  createdAt: string;
  artist: ArtistSummary;
  album: AlbumSummary | null;
}

export interface Artist {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  featured: boolean;
}

export interface Album {
  id: number;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  featured: boolean;
  artist: ArtistSummary;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PlaylistSummary {
  id: number;
  name: string;
  description: string | null;
  trackCount: number;
  totalDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrackItem {
  position: number;
  addedAt: string;
  track: Track;
}

export interface PlaylistDetail extends PlaylistSummary {
  tracks: PlaylistTrackItem[];
}

export interface HistoryEntry {
  id: number;
  playedAt: string;
  track: Track;
}

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
}

export interface FieldViolation {
  field: string;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: FieldViolation[];
}
