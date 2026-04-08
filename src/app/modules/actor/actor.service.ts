import { prisma } from "../../lib/prisma";
import { ICreateActor, IUpdateActor } from "./actor.interface";








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
    const result = await prisma.actor.update({
        where:{
            id:isActorExist.id
        },
        data:payload
    })
    return result
}

///minor


const deleteActor = async(id:string)=>{
    const result = await prisma.actor.delete({
        where:{
            id
        }
    })
    return result
}


const getAllActor = async()=>{
    const result = await prisma.actor.findMany()
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