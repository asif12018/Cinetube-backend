




export const mediaSearchableFields = [
  `title`, 
  `streamingPlatFrom`, 
  `genres.genre.name`, 
  `cast.actor.name`, // Add this for cast search
  `director`        // Ensure this is the correct field name in your Prisma schema
];

export const mediaFilterableFields = [`genres.genre.name`, `releaseYear`, `rating`, `viewCount` ,`streamingPlatFrom`,`avgRating`/* popularity field */];


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