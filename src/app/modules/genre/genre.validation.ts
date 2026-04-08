import z from "zod";

export const createGenre = z.object({
  name: z.string().min(3, "Genre name must be at least 3 characters long"),
  slug: z.string().min(3, "Genre slug must be at least 3 characters long"),
});

export const updateGenre = z.object({
  name: z
    .string()
    .min(3, "Genre name must be at least 3 characters long")
    .optional(),
  slug: z
    .string()
    .min(3, "Genre slug must be at least 3 characters long")
    .optional(),
});

export const GenreValidation = {
  createGenre,
  updateGenre,
};
