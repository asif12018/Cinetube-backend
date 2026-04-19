import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReview, IUpdateReview } from "./reviews.interface";
import { ReviewStatus } from "@prisma/client";
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

  // 2. Security Check: Is this user the actual author?
  if (existingReview.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to edit this review.");
  }

  // 3. Business Logic Check: Block edits on PUBLISHED reviews only.
  // This automatically allows both PENDING and UNPUBLISHED to pass through!
  if (existingReview.status === "PUBLISHED") {
    throw new AppError(status.BAD_REQUEST, "You cannot edit a published review.");
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

    // 5. Update the review, replace the tags, AND reset status to PENDING
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...updateData,
        // 🟢 CRUCIAL: If they edit a rejected (UNPUBLISHED) review, send it back to the Admin for review!
        status: "PENDING", 
        
        // If the frontend sent a new array of tags, replace the old ones
        ...(tags && {
          tags: {
            deleteMany: {}, 
            create: tags.map((tagId) => ({
              tagId: tagId,    
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



// const getReviewsByMediaId = async (mediaId: string) => {
//   // 1. Verify the movie/series actually exists
//   const isMediaExist = await prisma.media.findUnique({
//     where: { id: mediaId },
//   });

  

  

//   if (!isMediaExist) {
//     throw new AppError(status.NOT_FOUND, "Media not found.");
//   }

//   // 2. Fetch the reviews
//   const reviews = await prisma.review.findMany({
//     where: {
//       mediaId: mediaId,
//       status: "PUBLISHED", // Security: Only fetch approved reviews!
//     },
//     // Sort by newest first
//     orderBy: {
//       createdAt: "desc", 
//     },
//     include: {
//       // Include the User who wrote it (we use 'select' so we don't accidentally leak their password/email)
//       user: {
//         select: {
//           id: true,
//           // Assuming your user model has a name and photo, add them here:
//           // name: true, 
//           // profilePhoto: true 
//         },
//       },
//       // Include the tags
//       tags: {
//         include: {
//           tag: true,
//         },
//       },
//       comments:{
//         include:{
//           user:true
//         }
//       }
//     },
//   });

//   return reviews;
// };

// 🟢 1. Update the function to accept userId (it can be null if a guest is viewing!)
// const getReviewsByMediaId = async (mediaId: string, userId?: string | null) => {
//   // 1. Verify the movie/series actually exists
//   const isMediaExist = await prisma.media.findUnique({
//     where: { id: mediaId },
//   });

//   if (!isMediaExist) {
//     throw new AppError(status.NOT_FOUND, "Media not found.");
//   }

//   // 2. Fetch the reviews
//   const reviews = await prisma.review.findMany({
//     where: {
//       mediaId: mediaId,
//       status: "PUBLISHED", // Security: Only fetch approved reviews!
//     },
//     // Sort by newest first
//     orderBy: {
//       createdAt: "desc", 
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           image: true 
//         },
//       },
//       tags: {
//         include: {
//           tag: true,
//         },
//       },
//       comments:{
//         include:{
//           user: true
//         }
//       },
//       // 🟢 2. ADD THIS: If we have a userId, check if they liked it. If not, ignore likes entirely.
//       likes: userId ? {
//         where: { userId: userId }
//       } : false
//     },
//   });

//   // 🟢 3. MAP THE RESULTS: Transform the database array into a clean boolean
// const formattedReviews = reviews.map((review) => {
//     // STRICT CHECK: If likes array exists and has items, true. Else, false.
//     const isLiked = review.likes && review.likes.length > 0 ? true : false;
    
//     const { likes, ...reviewData } = review as any; 

//     return {
//       ...reviewData,
//       isLikedByCurrentUser: isLiked 
//     };
//   });

//   return formattedReviews;
// };

// 🟢 Update the function to accept userId (it can be null if a guest is viewing!)
const getReviewsByMediaId = async (mediaId: string, userId?: string | null) => {
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
      // 🟢 NEW: Use OR logic to fetch published reviews AND the user's own unpublished ones
      OR: [
        { status: "PUBLISHED" },
        // If userId exists, fetch their pending reviews. If not, fallback to a fake ID so it safely ignores this.
        { userId: userId || "UNAUTHENTICATED_GUEST" } 
      ]
    },
    // Sort by newest first
    orderBy: {
      createdAt: "desc", 
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true 
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      comments:{
        include:{
          user: true
        }
      },
      // If we have a userId, check if they liked it. If not, ignore likes entirely.
      likes: userId ? {
        where: { userId: userId }
      } : false
    },
  });

  // 🟢 3. MAP THE RESULTS: Transform the database array into a clean boolean
  const formattedReviews = reviews.map((review) => {
    // STRICT CHECK: If likes array exists and has items, true. Else, false.
    const isLiked = review.likes && review.likes.length > 0 ? true : false;
    
    // 🟢 NEW: Check if the current user is the author of this specific review
    const isOwner = userId ? userId === review.userId : false;
    
    const { likes, ...reviewData } = review as any; 

    return {
      ...reviewData,
      isLikedByCurrentUser: isLiked,
      isOwner: isOwner // 👈 Send this to the frontend!
    };
  });

  return formattedReviews;
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


const isUserHasReview = async(mediaId:string, userId:string) =>{
  const isMovieExist = await prisma.media.findFirst({
    where:{
      id:mediaId
    }
  });

  const isUserExist = await prisma.user.findFirst({
    where:{
      id:userId
    }
  })

  const isReviewExistForExist = await prisma.review.findFirst({
    where:{
      userId:userId,
      mediaId: mediaId
    }
  });

  if(!isReviewExistForExist){
    return false
  }

  return true
}







export const ReviewService = {
    createReview, 
    updateReview,
    getReviewsByMediaId,
    updateReviewStatus,
    getUnPublishedReview,
    isUserHasReview
}