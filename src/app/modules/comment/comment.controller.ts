import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { CommentServices } from "./comment.services";





const createComment = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const userId = req.user.userId;
    const payload = req.body;
   

    const result = await CommentServices.createComment(payload, reviewId as string, userId)

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Comment created successfully",
        data: result,
    })
})


const getAllCommentByReviewId = catchAsync(async(req:Request, res:Response)=>{
    const reviewId = req.params.id;
    const result = await CommentServices.getAllCommentByReviewId(reviewId as string);
    sendResponse(res,{
        httpStatusCode:status.OK,
        message:"Comments fetched successfully",
        success:true,
        data:result
    })
})





export const CommentController = {
    createComment,
    getAllCommentByReviewId
}