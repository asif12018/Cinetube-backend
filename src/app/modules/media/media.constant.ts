




export const mediaSearchableFields = [`title`, `slug`]

export const mediaFilterableFields = [`genres.genre.name`,`releaseYear`]


export const mediaIncludeConfig = {
    cast:{
        include:{
            actor: true
        }
    },
    genres:{
        include:{
            genre:true
        }
    }
}