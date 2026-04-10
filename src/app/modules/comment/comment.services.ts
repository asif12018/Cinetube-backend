import { prisma } from "../../lib/prisma";
import { NotificationService } from "../notification/notification.services";
import { ICreateComment } from "./comment.interface";











const createComment = async(payload: ICreateComment, reviewId: string, userId: string) =>{
     const isTheReviewExist = await prisma.review.findFirstOrThrow({
        where:{
            id: reviewId,
            status:"PUBLISHED"
        },
        include:{
            user:true
        }
     });

     const result = await prisma.comment.create({
        data:{
            ...payload,
            userId,
            reviewId
        }
     });

     //trigger notification

     await NotificationService.commentNotification(userId, isTheReviewExist.user.id);

     return result
}


const getAllCommentByReviewId = async(reviewId: string)=>{
    const isReviewExist = await prisma.review.findFirstOrThrow({
        where:{
            id: reviewId
        }
    });

    const result = await prisma.comment.findMany({
        where:{
            reviewId: isReviewExist.id
        },
        include:{
            user:true
        }
    })

    return result
}



export const CommentServices = {
    createComment,
    getAllCommentByReviewId

}