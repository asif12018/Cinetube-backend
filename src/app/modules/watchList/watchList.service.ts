import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"












const toggleWatchList = async(mediaId: string, userId: string) =>{
    //check is the media exist
    const isTheMediaExist = await prisma.media.findFirst({
        where:{
            id:mediaId,
            status:"PUBLISHED"
        }
    });

    if(!isTheMediaExist){
        throw new AppError(status.NOT_FOUND,"media not found")
    };

    //checking is it exist on watchlist
    const watchListItemExist = await prisma.watchlistItem.findUnique({
        where:{
            userId_mediaId:{
                userId: userId,
                mediaId: mediaId
            }
        }
    });

    if(!watchListItemExist){
        const newWatchList = await prisma.watchlistItem.create({
            data:{
                mediaId:mediaId,
                userId: userId
            }
        })
        return {
            success: true,
            message:"Item added to the watchlist",
            data: newWatchList
        }
    }else{
        const removeItemFromWatchList = await prisma.watchlistItem.delete({
            where:{
                id: watchListItemExist.id
            }
        })
        return {
            success: true,
            message:"Item removed from the watchlist",
            data: removeItemFromWatchList
        }
    }
}



const getUserWatchList = async(userId: string) =>{
    const result = await prisma.watchlistItem.findMany({
        where:{
            userId:userId
        },
        include:{
            media:true
        }
    })

    return result;
}


//check is the movie on the watchlist

const isMovieOnTheWatchList = async(movieId:string, userId: string) =>{
    const isTheMovieExist = await prisma.media.findFirst({
        where:{
            id:movieId
        }
    })

    const isTheUserExist = await prisma.user.findFirst({
        where:{
            id:userId
        }
    })

    if(!isTheMovieExist){
        throw new AppError(status.NOT_FOUND, "Movie not exist");
    }

    if(!isTheUserExist){
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    const result = await prisma.watchlistItem.findFirst({
        where:{
            mediaId:movieId,
            userId:userId
        }
    });

    if(!result){
        return false
    }

    return true
}





export const WatchListService = {
    toggleWatchList,
    getUserWatchList,
    isMovieOnTheWatchList
}