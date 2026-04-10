import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"












const readNotification = async(userId: string) =>{
    const isNotificationExist = await prisma.notification.findFirst({
        where:{
            userId:userId
        }
    });

    if(!isNotificationExist){
        throw new AppError(status.NOT_FOUND, "User not have any notification");
    }

    if(isNotificationExist.isRead === true){
        throw new AppError(status.BAD_REQUEST,"Notification already mark as read")
    }

    await prisma.notification.update({
        where:{
            id:isNotificationExist.id,
            userId: userId
        },
        data:{
            isRead:true
        }
    })
}


const likeNotification = async(userId: string, personId: string) =>{
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
        body: `${userData.name} liked your profile`,
        link: `/profile/${personData.id}`,
        isRead: false
    }
   })
}


const commentNotification = async(userId: string, personId: string) =>{
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
            body: `${userData.name} commented on your profile`,
            link: `/profile/${userData.id}`,
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