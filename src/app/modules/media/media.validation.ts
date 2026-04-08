import { z } from "zod";
import { MediaStatus, MediaType, PricingTier } from "../../../../generated/prisma";

// =============================================================
// MEDIA VALIDATION
// =============================================================

export const createMediaValidation = z.object({
  title: z.string().min(3,"title must be 3 character long"),
  slug: z.string().min(3,"slug must be 3 character long"),
  synopsis: z.string().min(3,"synopsis must be 3 character long"),
  type: z.string(),
  releaseYear: z.number().int().min(1800, "Year must be valid").max(9999, "Year must be 4 digits"),
  
  // Optional Fields
  director: z.string().optional(),
  posterUrl: z.string().url("Invalid URL format").optional(),
  backdropUrl: z.string().url("Invalid URL format").optional(),
  trailerUrl: z.string().url("Invalid URL format").optional(),
  streamingUrl: z.string().url("Invalid URL format").optional(),
  
  // Required Enums
  pricingTier: z.nativeEnum(PricingTier),
  status: z.nativeEnum(MediaStatus),

  // Pricing (Allows number, string, or null)
  rentPrice: z.union([z.number(), z.string()]).nullable().optional(),
  buyPrice: z.union([z.number(), z.string()]).nullable().optional(),

  // Timestamps (Typically not sent in req.body, but added to match interface)
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),

  // Relations (Using z.any() arrays since deep relation validation is usually handled separately)
  genreIds: z.array(z.string()).optional(),
  actorIds: z.array(z.string()).optional(), // Left as z.any() to support nested write arrays or single objects
  streamingLinks: z.array(z.any()).optional(),
  reviews: z.array(z.any()).optional(),
  watchlistItems: z.array(z.any()).optional(),
  purchases: z.array(z.any()).optional(),
});

// Using .partial() automatically makes every field inside createMediaValidation optional!
export const updateMediaValidation = createMediaValidation.partial();


// =============================================================
// MEDIA CAST VALIDATION
// =============================================================

export const createMediaCastValidation = z.object({
  mediaId: z.string(),
  actorId: z.string(),
});

export const updateMediaCastValidation = z.object({
  actorId: z.string().optional(),
});


// =============================================================
// MEDIA STREAMING LINK VALIDATION
// =============================================================

export const createMediaStreamingLinkValidation = z.object({
  mediaId: z.string(),
  platformId: z.string(), // Note: fixed spelling of 'platformId' here
});

export const updateMediaStreamingLinkValidation = z.object({
  platformId: z.string().optional(),
});

// Exporting everything together
export const MediaValidations = {
  createMediaValidation,
  updateMediaValidation,
  createMediaCastValidation,
  updateMediaCastValidation,
  createMediaStreamingLinkValidation,
  updateMediaStreamingLinkValidation
};