export type UserRole = 'ADMIN' | 'ORGANIZER' | 'ARTIST';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  artistProfile?: { id: number } | null;
  organizerProfile?: { id: number } | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ArtistProfile {
  id: number;
  userId: number;
  stageName: string;
  biography?: string | null;
  city: string;
  artistType: 'SOLO' | 'BAND' | 'DJ';
  memberCount: number;
  minimumFee: number | string;
  maximumFee: number | string;
  averageRating: number | string;
  totalPerformances: number;
  yearsOfExperience: number;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  isAvailable: boolean;
  genres?: { genre: Genre }[];
  user?: Partial<User>;
}

export interface OrganizerProfile {
  id: number;
  userId: number;
  organizationName: string;
  description?: string | null;
  city: string;
  phone?: string | null;
  user?: Partial<User>;
  events?: EventItem[];
  _count?: { events: number };
}

export interface EventItem {
  id: number;
  title: string;
  description?: string | null;
  eventType: string;
  city: string;
  venue: string;
  address?: string | null;
  startDateTime: string;
  endDateTime: string;
  expectedAudience: number;
  minimumBudget: number | string;
  maximumBudget: number | string;
  preferredArtistType: string;
  status: string;
  genres?: { genre: Genre }[];
  organizer?: OrganizerProfile & { user?: Partial<User> };
  _count?: { applications: number; performances: number; recommendations: number };
}

export interface Application {
  id: number;
  eventId: number;
  artistId: number;
  applicationType: 'APPLY' | 'INVITE';
  status: string;
  message?: string | null;
  event?: EventItem;
  artist?: ArtistProfile;
  createdAt: string;
}

export interface Performance {
  id: number;
  eventId: number;
  artistId: number;
  startDateTime: string;
  endDateTime: string;
  agreedFee: number | string;
  status: string;
  event?: EventItem;
  artist?: ArtistProfile;
}

export interface Recommendation {
  id: number;
  artistId: number;
  score: number;
  modelVersion: string;
  explanation: string | string[];
  artist: ArtistProfile;
  createdAt: string;
  genreMatch?: number;
}

export interface Review {
  id: number;
  eventId: number;
  organizerId: number;
  artistId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
