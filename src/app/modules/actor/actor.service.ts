import { Actor ,Prisma} from "../../../../generated/prisma";
import { prisma } from "../../lib/prisma";
import { deleteFileFromCloudinary } from "../../utils/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ActorFilterAbleFileds, ActorSearchAbleFields } from "./actor.constant";
import { ICreateActor, IUpdateActor } from "./actor.interface";
import { IQueryParams } from "../../../interface/query.interface";








const createActor = async(payload:ICreateActor)=>{
    const result = await prisma.actor.create({
        data:payload
    })
    return result
}


const updateActor = async(id:string,payload:IUpdateActor)=>{
    const isActorExist = await prisma.actor.findFirst({
        where:{
            id
        }
    })
    if(!isActorExist){
        throw new Error("Actor not found")
    }
    if(isActorExist.photoUrl && payload.photoUrl){
        await deleteFileFromCloudinary(isActorExist.photoUrl);
    }
    const result = await prisma.actor.update({
        where:{
            id:isActorExist.id
        },
        data:payload
    })
    return result
}




const deleteActor = async(id:string)=>{
    const result = await prisma.actor.delete({
        where:{
            id
        }
    })

    if(result.photoUrl){
        await deleteFileFromCloudinary(result.photoUrl)
    }
    return result
}


const getAllActor = async(query: IQueryParams)=>{

    const queryBuilder = new QueryBuilder<Actor, Prisma.ActorWhereInput, Prisma.ActorInclude>(prisma.actor, query,{
        searchableFields: ActorSearchAbleFields,
        filterableFields: ActorFilterAbleFileds
    });
    
    const result = await queryBuilder.search().filter().paginate().sort().fields().execute();

    return result
}


const getActorById = async(id:string)=>{
    const result = await prisma.actor.findUnique({
        where:{
            id
        }
    })
    return result
}


export const ActorService = {
    createActor,
    updateActor,
    deleteActor,
    getAllActor,
    getActorById
}