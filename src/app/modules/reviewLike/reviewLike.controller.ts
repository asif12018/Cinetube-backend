import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewLikeService } from "./reviewLikeServices";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const toggleReviewLike = catchAsync(async (req: Request, res: Response) => {
  const userData = req.user;
  const reviewId = req.params.id;
 
  // const result = await ReviewLikeService.reviewLike(
  //   userData.id,
  //   reviewId as string,
  // );
   const result = await ReviewLikeService.toggleReviewLike(
    reviewId as string,
    userData.userId as string
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    message: "Action done successfully",
    success: true,
    data: result,
  });
});




const getAllReviewLikeByReviewId = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const result = await ReviewLikeService.getAllReviewLikeByReviewId(reviewId as string);
    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Review like fetched successfully",
        success:true,
        data:result
    })
})


const getReviewByUserIdAndReviewId = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const userData = req.user;
    const result = await ReviewLikeService.getReviewByUserIdAndReviewId(reviewId as string, userData.userId as string);
    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Review like fetched successfully",
        success:true,
        data:result
    })
})




export const ReviewLikeController = {
    toggleReviewLike,
    getAllReviewLikeByReviewId,
    getReviewByUserIdAndReviewId
}
