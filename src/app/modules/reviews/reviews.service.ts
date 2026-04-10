import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReview, IUpdateReview } from "./reviews.interface";
import { ReviewStatus } from "../../../../generated/prisma";
import { updateMediaAggregateStats } from "../../helperFunciton/recalculateAvgReview";
import { notifiedByAdmin } from "../../helperFunciton/notificationHelper";










const createReview = async (payload: ICreateReview, mediaId: string, userId: string) => {
  // 1. Separate the tags array from the rest of the payload
  const { tags, ...reviewData } = payload;

  // 2. Validate User and Media existence (Fail fast outside the transaction)
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isMediaExist = await prisma.media.findUnique({
    where: { id: mediaId },
  });
  if (!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // 3. Prevent duplicate reviews (One user, one review per title)
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
  });
  
  if (existingReview) {
    throw new AppError(status.CONFLICT, "You have already reviewed this media.");
  }

  // 4. Execute database operations inside a Transaction
  const result = await prisma.$transaction(async (tx) => {
    
    // Optional but recommended: Verify all provided Tag IDs actually exist
    if (tags && tags.length > 0) {
      const existingTags = await tx.tag.findMany({
        where: { id: { in: tags } },
      });
      
      if (existingTags.length !== tags.length) {
        throw new AppError(status.BAD_REQUEST, "One or more Tag IDs are invalid.");
      }
    }

    // 5. Create the Review and auto-populate the ReviewTag table
    const newReview = await tx.review.create({
      data: {
        ...reviewData,
        userId,
        mediaId,
        // If tags array exists and has items, dynamically build the nested 'create' query
        ...(tags && tags.length > 0 && {
          tags: {
            create: tags.map((tagId) => ({
              tagId: tagId,
            })),
          },
        }),
      },
      // 6. Include relationships so you can return the full object to the frontend
      include: {
        tags: {
          include: {
            tag: true, // Returns the actual tag details (e.g., name: "Masterpiece")
          },
        },
      },
    });

    // Note: If you aren't using a database trigger for avgRating/totalReviews, 
    // you would update the Media's aggregate stats right here inside the transaction.

    return newReview;
  });

  return result;
};



const updateReview = async (reviewId: string, userId: string, payload: IUpdateReview) => {
  const { tags, ...updateData } = payload;

  // 1. Find the exact review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new AppError(status.NOT_FOUND, "Review not found.");
  }

  // 2. Security Check: Is this user the actual author of the review?
  if (existingReview.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to edit this review.");
  }

  // 3. Business Logic Check: Is the review unpublished?
  // According to your requirements, users cannot edit approved/published reviews!
  if (existingReview.status !== "PENDING") {
    throw new AppError(status.BAD_REQUEST, "You can only edit unpublished (pending) reviews.");
  }

  // 4. Execute the update inside a transaction
  const result = await prisma.$transaction(async (tx) => {
    
    // If the user provided new tags, verify they actually exist first
    if (tags && tags.length > 0) {
      const existingTags = await tx.tag.findMany({
        where: { id: { in: tags } },
      });
      if (existingTags.length !== tags.length) {
        throw new AppError(status.BAD_REQUEST, "One or more Tag IDs are invalid.");
      }
    }

    // 5. Update the review and replace the tags
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...updateData,
        // If the frontend sent a new array of tags, replace the old ones
        ...(tags && {
          tags: {
            deleteMany: {}, // This safely removes the OLD tags connected to this review
            create: tags.map((tagId) => ({
              tagId: tagId,     // This connects the NEW tags
            })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return updatedReview;
  });

  return result;
};



const getReviewsByMediaId = async (mediaId: string) => {
  // 1. Verify the movie/series actually exists
  const isMediaExist = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  

  

  if (!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found.");
  }

  // 2. Fetch the reviews
  const reviews = await prisma.review.findMany({
    where: {
      mediaId: mediaId,
      status: "PUBLISHED", // Security: Only fetch approved reviews!
    },
    // Sort by newest first
    orderBy: {
      createdAt: "desc", 
    },
    include: {
      // Include the User who wrote it (we use 'select' so we don't accidentally leak their password/email)
      user: {
        select: {
          id: true,
          // Assuming your user model has a name and photo, add them here:
          // name: true, 
          // profilePhoto: true 
        },
      },
      // Include the tags
      tags: {
        include: {
          tag: true,
        },
      },
      comments:true
    },
  });

  return reviews;
};


const updateReviewStatus = async(payload:any, reviewId:string) =>{
    const result = await prisma.review.update({
        where: { id: reviewId },
        data: {
            status: payload,
        },
        include:{
            tags: {
                include:{
                    tag: true
                }
            },
            user: true
        }
    });

    //recalculating avg review

    await updateMediaAggregateStats(result.mediaId);

    //trigger notification

    await notifiedByAdmin(result.userId, result.status as string)

    return result;
}



const getUnPublishedReview = async()=>{
    const result = await prisma.review.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            user: true,
            tags: {
                include: {
                    tag: true,
                    
                },
            },
        },
    })
    return result;
}







export const ReviewService = {
    createReview, 
    updateReview,
    getReviewsByMediaId,
    updateReviewStatus,
    getUnPublishedReview
}