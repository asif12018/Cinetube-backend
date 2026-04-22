import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"












const readNotification = async(userId: string) =>{
    const result = await prisma.notification.updateMany({
        where:{
            userId: userId,
            isRead: false
        },
        data:{
            isRead: true
        }
    });

    if (result.count === 0) {
        throw new AppError(status.BAD_REQUEST, "No unread notifications found");
    }
}


const likeNotification = async(userId: string, personId: string, mediaId:string) =>{
   const userData = await prisma.user.findFirstOrThrow({
    where:{
        id: userId
    }
   });

   const personData = await prisma.user.findFirstOrThrow({
    where:{
        id: personId
    }
   });

   const result = await prisma.notification.create({
    data:{
        userId: personData.id,
        personId: userData.id,
        title: "Like",
        body: `${userData.name} liked your review`,
        link: `/movie/${mediaId}`,
        isRead: false
    }
   })
}


const commentNotification = async(userId: string, personId: string, mediaId:string) =>{
    const userData = await prisma.user.findFirstOrThrow({
        where:{
            id: userId
        }
    });

    const personData = await prisma.user.findFirstOrThrow({
        where:{
            id: personId
        }
    });

    const result = await prisma.notification.create({
        data:{
            userId: personData.id,
            personId: userData.id,
            title: "Comment",
            body: `${userData.name} commented on your review`,
            link: `/movie/${mediaId}`,
            isRead: false
        }
    })
}


const getAllUserNotification = async(userId: string) =>{
    const result = await prisma.notification.findMany({
        where:{
            userId: userId,
            isRead: false,
        },
        orderBy:{
            createdAt: "desc"
        }
    });

    return result;
}




export const NotificationService = {
    readNotification,
    likeNotification,
    commentNotification,
    getAllUserNotification
}