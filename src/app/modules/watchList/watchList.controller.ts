import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { WatchListService } from "./watchList.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";








const toggleWatchList = catchAsync(async(req:Request, res:Response)=>{
    const mediaId = req.params.id;
    const userData = req.user;
    const result = await WatchListService.toggleWatchList(mediaId as string, userData.userId);
    sendResponse(res,{
        httpStatusCode: status.CREATED,
        message:"Action done successfully",
        success: true,
        data: result
    })
})



const getUserWatchList = catchAsync(async(req:Request, res:Response)=>{
    const userId = req.user.userId;
    const result = await WatchListService.getUserWatchList(userId);
    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Watch list retrieved successfully",
        success: true,
        data: result
    })
})


const isMovieOnTheWatchList = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const movieId = req.body.movieId;
    const result = await WatchListService.isMovieOnTheWatchList(movieId, user.userId);

    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"List checked successfully",
        success:true,
        data: result
    })
})





export const WatchListController = {
    toggleWatchList,
    getUserWatchList,
    isMovieOnTheWatchList
}