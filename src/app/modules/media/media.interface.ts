import { Genre, MediaCast, MediaStatus, MediaStreamingLink, MediaType, PricingTier, Purchase, Review, WatchlistItem } from "../../../../generated/prisma";





export interface ICreateMedia{
  title: string;
  slug: string;
  synopsis: string;
  type: MediaType;
  releaseYear: number;
  
  // Optional Fields
  director?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  streamingUrl?: string;
  
  // Defaults in DB, but required in TS once fetched
  pricingTier: PricingTier;
  status: MediaStatus;

  // Pay-Per-View Pricing
  // Note: Prisma returns Decimals as objects. When sending via JSON, they become strings or numbers.
  rentPrice?: number | string | null; 
  buyPrice?: number | string | null;

  // Timestamps
  createdAt: Date | string; // Date object from DB, string if coming from JSON API
  updatedAt: Date | string;

  // Relations (Optional because you might not always 'include' them in Prisma queries)
  genreIds?: string[];
  actorIds?: string[];
  streamingLinks?: MediaStreamingLink[];
  reviews?: Review[];
  watchlistItems?: WatchlistItem[];
  purchases?: Purchase[];

}

export interface IUpdateMedia {
  title?: string;
  slug?: string;
  synopsis?: string;
  type?: MediaType;
  releaseYear?: number;
  
  // Previously Optional Fields
  director?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  streamingUrl?: string;
  
  // Previously Required Fields
  pricingTier?: PricingTier;
  status?: MediaStatus;

  // Pay-Per-View Pricing
  rentPrice?: number | string | null; 
  buyPrice?: number | string | null;

  // Timestamps 
  // Note: Usually you don't send `createdAt` in an update payload, 
  // but it is marked optional here per your request!
  createdAt?: Date | string; 
  updatedAt?: Date | string;

  // Relations
  genreIds?: string[];
  actorIds?: string[];
  streamingLinks?: MediaStreamingLink[];
  reviews?: Review[];
  watchlistItems?: WatchlistItem[];
  purchases?: Purchase[];
}


export interface IMediaCast{
    mediaId: string;
    actorId: string;
}

export interface IUpdateMediaCast{
    actorId?: string
}

export interface IMediaStreamingLink{
    mediaId: string;
    paltfromId: string;
}

export interface IUpdateMediaStreamingLink{
    paltfromId?: string;
}