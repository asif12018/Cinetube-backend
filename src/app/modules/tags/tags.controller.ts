import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { TagService } from "./tags.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";











const getAllTags = catchAsync(async(req:Request, res:Response)=>{
    const result = await TagService.getAllTags();

    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Tags fetched successfully",
        success:true,
        data:result
    })
})



export const TagController = {
    getAllTags
}