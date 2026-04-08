import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ActorService } from "./actor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../../interface/query.interface";





const createActor = catchAsync(async(req:Request, res:Response)=>{
    let payload = req.body;
    if(req.file){
        payload.photoUrl = req.file.path;
    }
    const result = await ActorService.createActor(payload);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success:true,
        message:"Actor created successfully",
        data:result
    })
})


const updateActor = catchAsync(async(req:Request, res:Response)=>{
    const id = req.params.id;
     let payload = req.body;
    if(req.file){
        payload.photoUrl = req.file.path;
    }
    const result = await ActorService.updateActor(id as string,payload);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"Actor updated successfully",
        data:result
    })
})


const deleteActor = catchAsync(async(req:Request, res:Response)=>{
    const id = req.params.id;
    const result = await ActorService.deleteActor(id as string);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"Actor deleted successfully",
        data:result
    })
})


const getAllActor = catchAsync(async(req:Request, res:Response)=>{
    const result = await ActorService.getAllActor(req.query as IQueryParams);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"Actor fetched successfully",
        data:result
    })
})


const getActorById = catchAsync(async(req:Request, res:Response)=>{
    const id = req.params.id;
    const result = await ActorService.getActorById(id as string);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success:true,
        message:"Actor fetched successfully",
        data:result
    })
})


export const ActorController = {
    createActor,
    updateActor,
    deleteActor,
    getAllActor,
    getActorById
}