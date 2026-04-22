import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./reviews.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";









const createReview = catchAsync(async(req:Request, res:Response)=>{
    const mediaId = req.params.id;
    const userId = req.user.userId;
    const payload = req.body;
   

    const result = await ReviewService.createReview(payload, mediaId as string, userId)

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Review created successfully",
        data: result,
    })
})





const updateReview = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const userId = req.user.userId;
    const payload = req.body;

    const result = await ReviewService.updateReview(reviewId as string, userId, payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    })
})



// const getReviewByMedia = catchAsync(async(req:Request, res:Response)=>{
//     const mediaId = req.params.id;
//     const result = await ReviewService.getReviewsByMediaId(mediaId as string);
//     sendResponse(res,{
//         httpStatusCode: status.OK,
//         success: true,
//         message:"Review retrieved successfully",
//         data: result
//     })
// });

const getReviewByMedia = catchAsync(async(req: Request, res: Response) => {
    const mediaId = req.params.id;
    
    // 🟢 1. Grab the user object from the checkAuth middleware
    const user = (req as any).user;
    console.log("MIDDLEWARE USER OBJECT:", user); // 👈 THIS LOG IS CRITICAL

    // 🟢 2. Extract the ID safely
    const userId = user?.id || user?.userId || null; 
    console.log("EXTRACTED USER ID:", userId); // 👈 THIS LOG IS CRITICAL

    // 🟢 3. Pass it to the service
    const result = await ReviewService.getReviewsByMediaId(mediaId as string, userId);
    
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review retrieved successfully",
        data: result
    })
});


const updateReviewStatus = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const reviewStatus = req.body.status;
    const result = await ReviewService.updateReviewStatus(reviewStatus, reviewId as string);
    
    sendResponse(res,{
        httpStatusCode: status.OK,
        success: true,
        message: "Review status updated successfully",
        data: result
    })
})



const getUnPublishedReview = catchAsync(async(req:Request, res:Response)=>{
    const result = await ReviewService.getUnPublishedReview();
    sendResponse(res,{
        httpStatusCode: status.OK,
        success: true,
        message: "Unpublished reviews retrieved successfully",
        data: result
    })
})


const isUserHasReview = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const mediaId = req.params.id;
    const result = await ReviewService.isUserHasReview(mediaId as string, user.userId);
    sendResponse(res,{
        httpStatusCode: status.OK,
        success: true,
        message:"User has review status checked successfully",
        data: result
    })
})


//delete review

const deleteReview = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const result = await ReviewService.deleteReview(reviewId as string)
      sendResponse(res,{
        httpStatusCode: status.OK,
        success: true,
        message:"Admin has deleted the review",
        data: result
    })
})



export const ReviewController = {
    createReview,
    updateReview,
    updateReviewStatus,
    getUnPublishedReview,
    getReviewByMedia,
    isUserHasReview,
    deleteReview
}


