import { prisma } from "../../lib/prisma"













const getAllTags = async()=>{
    const result = await prisma.tag.findMany();
    return result
}



export const TagService = {
    getAllTags
}