// import z from "zod"




// const createActorValidation = z.object({
//     body: z.object({
//         name: z.string().min(3,"Actor Name must be 3 character long"),
//         photoUrl: z.string().optional(),
//     })
// })


// const updateActorValidation = z.object({
//     body: z.object({
//         name: z.string().min(3,"Actor Name must be 3 character long").optional(),
//         photoUrl: z.string().optional(),
//     })
// })


// export const ActorValidation = {
//     createActorValidation,
//     updateActorValidation
// }



import z from "zod"

const createActorValidation = z.object({
    name: z.string().min(3, "Actor Name must be 3 character long"),
    photoUrl: z.string().optional(),
})

const updateActorValidation = z.object({
    name: z.string().min(3, "Actor Name must be 3 character long").optional(),
    photoUrl: z.string().optional(),
})

export const ActorValidation = {
    createActorValidation,
    updateActorValidation
}