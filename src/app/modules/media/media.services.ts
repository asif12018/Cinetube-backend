import status from "http-status";
import { prisma } from "../../lib/prisma"; // Adjust path to your prisma instance
import AppError from "../../../errorHelpers/AppError"; // Adjust path to your error handler
import { ICreateMedia, IUpdateMedia } from "./media.interface"; // Adjust path to your interfaces

// =============================================================
// 1. CREATE MEDIA
// =============================================================
const createMedia = async (payload: ICreateMedia) => {
  // Extract ALL relational arrays so they don't crash Prisma's base data
  const { 
    actorIds, 
    genreIds, 
    streamingLinks, 
    reviews, 
    watchlistItems, 
    purchases, 
    ...mediaData 
  } = payload;

  const result = await prisma.$transaction(async (tx) => {
    let castDataToInsert: any[] = [];
    let genreDataToInsert: any[] = [];

    // --- VERIFY & PREPARE ACTORS ---
    if (actorIds && actorIds.length > 0) {
      const existingActors = await tx.actor.findMany({
        where: { id: { in: actorIds } },
      });

      if (existingActors.length !== actorIds.length) {
        throw new AppError(status.BAD_REQUEST, "One or more Actor IDs do not exist.");
      }

      castDataToInsert = actorIds.map((id) => ({ actorId: id }));
    }

    // --- VERIFY & PREPARE GENRES ---
    if (genreIds && genreIds.length > 0) {
      const existingGenres = await tx.genre.findMany({
        where: { id: { in: genreIds } },
      });

      if (existingGenres.length !== genreIds.length) {
        throw new AppError(status.BAD_REQUEST, "One or more Genre IDs do not exist.");
      }

      genreDataToInsert = genreIds.map((id) => ({ genreId: id }));
    }

    // --- INSERT INTO DATABASE ---
    const newMedia = await tx.media.create({
      data: {
        ...mediaData,
        // Nested writes to automatically populate the join tables
        cast: { create: castDataToInsert },
        genres: { create: genreDataToInsert },
      },
      // Include related data in the return object so you can see it in Postman
      include: {
        cast: { include: { actor: true } },
        genres: { include: { genre: true } },
      },
    });

    return newMedia;
  },{
    maxWait: 5000,
    timeout:10000
  });

  return result;
};

// =============================================================
// 2. UPDATE MEDIA
// =============================================================
const updateMedia = async (id: string, payload: IUpdateMedia) => {
  // Extract ALL relational arrays here too
  const { 
    actorIds, 
    genreIds, 
    streamingLinks, 
    reviews, 
    watchlistItems, 
    purchases, 
    ...mediaData 
  } = payload;

  const result = await prisma.$transaction(async (tx) => {
    // Check if the movie actually exists first
    const isMediaExist = await tx.media.findUnique({ where: { id } });
    if (!isMediaExist) {
      throw new AppError(status.NOT_FOUND, "Media not found.");
    }

    // --- HANDLE ACTOR UPDATES ---
    if (actorIds) {
      if (actorIds.length > 0) {
        const existingActors = await tx.actor.findMany({
          where: { id: { in: actorIds } },
        });
        if (existingActors.length !== actorIds.length) {
          throw new AppError(status.BAD_REQUEST, "One or more Actor IDs do not exist.");
        }
      }
      // Wipe the old cast list for this movie
      await tx.mediaCast.deleteMany({ where: { mediaId: id } });
    }

    // --- HANDLE GENRE UPDATES ---
    if (genreIds) {
      if (genreIds.length > 0) {
        const existingGenres = await tx.genre.findMany({
          where: { id: { in: genreIds } },
        });
        if (existingGenres.length !== genreIds.length) {
          throw new AppError(status.BAD_REQUEST, "One or more Genre IDs do not exist.");
        }
      }
      // Wipe old genres
      await tx.mediaGenre.deleteMany({ where: { mediaId: id } });
    }

    // --- APPLY UPDATES TO DATABASE ---
    const updatedMedia = await tx.media.update({
      where: { id },
      data: {
        ...mediaData,
        // Only trigger 'create' if the arrays were actually provided in the payload
        ...(actorIds && { cast: { create: actorIds.map((actId) => ({ actorId: actId })) } }),
        ...(genreIds && { genres: { create: genreIds.map((genId) => ({ genreId: genId })) } }),
      },
      include: {
        cast: { include: { actor: true } },
        genres: { include: { genre: true } },
      },
    });

    return updatedMedia;
  });

  return result;
};

// =============================================================
// 3. GET ALL MEDIA
// =============================================================
const getAllMedia = async () => {
  const result = await prisma.media.findMany({
    include: {
      cast: { include: { actor: true } },
      genres: { include: { genre: true } },
    },
  });
  return result;
};

// =============================================================
// 4. GET MEDIA BY ID
// =============================================================
const getMediaById = async (id: string) => {
  const result = await prisma.media.findUnique({
    where: { id },
    include: {
      cast: { include: { actor: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  return result;
};

// =============================================================
// 5. DELETE MEDIA
// =============================================================
const deleteMedia = async (id: string) => {
  const isMediaExist = await prisma.media.findUnique({ where: { id } });
  
  if (!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // Because of `onDelete: Cascade` in your Prisma schema, 
  // deleting the Media will automatically delete all related rows in MediaCast and MediaGenre!
  const result = await prisma.media.delete({
    where: { id },
  });

  return result;
};

// Export the service
export const MediaService = {
  createMedia,
  updateMedia,
  getAllMedia,
  getMediaById,
  deleteMedia,
};