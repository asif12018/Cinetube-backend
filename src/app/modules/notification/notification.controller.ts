import { Request, Response } from "express";
import { NotificationService } from "./notification.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";











const readNotification = catchAsync(async(req:Request, res:Response)=>{
    const userData = req.user;
    const result = await NotificationService.readNotification(userData.userId as string);

    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Notification read successfully",
        success: true,
        data: result
    })
});


const getAllUserNotification = catchAsync(async(req:Request, res:Response)=>{
    const userData = req.user;
    const result = await NotificationService.getAllUserNotification(userData.userId);
    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Notification retreive successfully",
        success: true,
        data: result
    })
})



export const NotificationController = {
    readNotification,
    getAllUserNotification
}