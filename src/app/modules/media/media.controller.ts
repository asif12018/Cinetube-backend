import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { MediaService } from "./media.services";
import { sendResponse } from "../../shared/sendResponse";
import { IQueryParams } from "../../../interface/query.interface";


// =============================================================
// 1. CREATE MEDIA
// =============================================================
const createMedia = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  // 1. FORMAT DATA: Convert form-data strings back into their proper types
  
  // Convert release year to a number
  if (payload.releaseYear) {
    payload.releaseYear = Number(payload.releaseYear);
  }

  // Convert actorIds string back into an array
  if (payload.actorIds && typeof payload.actorIds === "string") {
    // This safely removes the brackets and splits the string by comma into an array
    payload.actorIds = payload.actorIds.replace(/^\[|\]$/g, "").split(",").map((id: string) => id.trim());
  }

  // Convert genreIds string back into an array
  if (payload.genreIds && typeof payload.genreIds === "string") {
    payload.genreIds = payload.genreIds.replace(/^\[|\]$/g, "").split(",").map((id: string) => id.trim());
  }

  // Convert prices to numbers (if they exist)
  if (payload.rentPrice) payload.rentPrice = Number(payload.rentPrice);
  if (payload.buyPrice) payload.buyPrice = Number(payload.buyPrice);


  // 2. FILE UPLOADS: Handle the multiple file uploads from Multer
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files["poster"] && files["poster"].length > 0) {
      payload.posterUrl = files["poster"][0].path;
    }
    if (files["backdrop"] && files["backdrop"].length > 0) {
      payload.backdropUrl = files["backdrop"][0].path;
    }
  }

  // 3. SEND TO SERVICE
  const result = await MediaService.createMedia(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Media created successfully",
    data: result,
  });
});

// =============================================================
// 2. GET ALL MEDIA
// =============================================================
const getAllMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.getAllMedia(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All media retrieved successfully",
    data: result,
  });
});

// =============================================================
// 3. GET MEDIA BY ID
// =============================================================
const getMediaById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MediaService.getMediaById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media retrieved successfully",
    data: result,
  });
});

// =============================================================
// 4. UPDATE MEDIA
// =============================================================
const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  // 1. FORMAT DATA: Convert form-data strings back into their proper types
  
  // Convert release year to a number
  if (payload.releaseYear) {
    payload.releaseYear = Number(payload.releaseYear);
  }

  // Convert actorIds string back into an array
  if (payload.actorIds && typeof payload.actorIds === "string") {
    payload.actorIds = payload.actorIds.replace(/^\[|\]$/g, "").split(",").map((id: string) => id.trim());
  }

  // Convert genreIds string back into an array
  if (payload.genreIds && typeof payload.genreIds === "string") {
    payload.genreIds = payload.genreIds.replace(/^\[|\]$/g, "").split(",").map((id: string) => id.trim());
  }

  // Convert prices to numbers
  if (payload.rentPrice) payload.rentPrice = Number(payload.rentPrice);
  if (payload.buyPrice) payload.buyPrice = Number(payload.buyPrice);

  // 2. FILE UPLOADS: Grab new images if the user provided them
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files["poster"] && files["poster"].length > 0) {
      payload.posterUrl = files["poster"][0].path;
    }
    if (files["backdrop"] && files["backdrop"].length > 0) {
      payload.backdropUrl = files["backdrop"][0].path;
    }
  }

  // 3. SEND TO SERVICE
  const result = await MediaService.updateMedia(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media updated successfully",
    data: result,
  });
});




// =============================================================
// 5. DELETE MEDIA
// =============================================================
const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MediaService.deleteMedia(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media deleted successfully",
    data: result, // Usually returns the deleted record
  });
});

// Export the controller
export const MediaController = {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};