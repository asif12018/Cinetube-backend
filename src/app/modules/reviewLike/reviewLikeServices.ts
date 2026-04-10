import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { NotificationService } from "../notification/notification.services";










// const reviewLike = async(reviewId: string, userId:string) =>{
//     const isReviewExist = await prisma.review.findFirstOrThrow({
//         where:{
//             id:reviewId,
//             status: "PUBLISHED"
//         }
//     });

//     const isLikeExist = await prisma.reviewLike.findFirstOrThrow({
//         where:{
//              userId: userId,
//              reviewId: reviewId
//         }
//     });

//     if(!isLikeExist){
//         //creating a like
//         const result = await prisma.reviewLike.create({
//             data:{
//                 userId: userId,
//                 reviewId: isReviewExist.id
//             }
//         });

//         //creating notification
//         await NotificationService.likeNotification(userId, isReviewExist.userId);
//         return {
//             success: true,
//             message: "Review liked successfully",
//             data: result
//         }
//     }else{
//         //deleting a like
//         const result = await prisma.reviewLike.delete({
//             where:{
//                 id: isLikeExist.id,
//                 userId: userId
//             }
//         });
//         return {
//             success: true,
//             message: "Review unliked successfully",
//             data: result
//         }
//     }


// }

const toggleReviewLike = async (reviewId: string, userId: string) => {

    // 1. Ensure the review actually exists and is public
    const isReviewExist = await prisma.review.findFirst({
        where: {
            id: reviewId,
            status: "PUBLISHED"
        }
    });

    if (!isReviewExist) {
        throw new AppError(status.NOT_FOUND, "Review not found or not published.");
    }

    // 2. Safely check if the like already exists (Returns null if it doesn't)
    const existingLike = await prisma.reviewLike.findUnique({
        where: {
            userId_reviewId: {
                userId: userId,
                reviewId: reviewId
            }
        }
    });

    // 3. The Toggle Logic
    if (!existingLike) {
        // STATE A: User hasn't liked it yet -> Create Like
        const newLike = await prisma.reviewLike.create({
            data: {
                userId: userId,
                reviewId: reviewId
            }
        });

        // Fire off the notification (Don't await it if you want the API to return faster!)
        NotificationService.likeNotification(userId, isReviewExist.userId).catch(console.error);
        
        return {
            success: true,
            message: "Review liked successfully",
            data: newLike
        }
    } else {
        // STATE B: User already liked it -> Delete Like (Unlike)
        const removedLike = await prisma.reviewLike.delete({
            where: {
                id: existingLike.id
            }
        });
        
        return {
            success: true,
            message: "Review unliked successfully",
            data: removedLike
        }
    }
}



const getAllReviewLikeByReviewId = async(reviewId: string) =>{
    const result = await prisma.reviewLike.findMany({
        where:{
            reviewId: reviewId
        },
        include:{
            user:true
        }
    });

    return result;
}


const getReviewByUserIdAndReviewId = async(reviewId: string, userId: string) =>{
    const result = await prisma.reviewLike.findFirst({
        where:{
            userId: userId,
            reviewId: reviewId
        }
    });

    return result;
}




export const ReviewLikeService = {
    toggleReviewLike,
    // reviewLike,
    getAllReviewLikeByReviewId,
    getReviewByUserIdAndReviewId
}