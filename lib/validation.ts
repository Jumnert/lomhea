import { z } from "zod";

/**
 * Zod schemas for all API inputs to ensure validation and sanitization.
 */

export const placeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  nameKh: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  category: z.string().min(1, "Category is required"),
  province: z.string().min(1, "Province is required"),
  images: z.array(z.string()).optional(),
  isVerified: z.boolean().default(false),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  placeId: z.string().cuid(),
});

export const reportSchema = z.object({
  placeId: z.string().cuid(),
  reason: z.string().min(1),
  details: z.string().max(500).optional(),
});
