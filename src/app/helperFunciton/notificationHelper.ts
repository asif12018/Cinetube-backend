




//trigger notification by admin

import { prisma } from "../lib/prisma"

export const notifiedByAdmin = async(userId:string, content: string, mediaId:string)=>{
    const result = await prisma.notification.create({
        data:{
            userId,
            title: `Notification from admin`,
            body:`Your review has been ${content}`,
            link:`movie/${mediaId}`
        }
    })
}