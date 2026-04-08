// import { NextFunction, Request, Response } from "express";
// import z from "zod";

// //zod validation middleware

// export const validateRequest = (ZodSchema: z.ZodObject) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     console.log(req.body.data);
//     if (req.body.data) {
//       req.body = JSON.parse(req.body.data);
//     }

//     const parseResult = ZodSchema.safeParse(req.body);
//     if (!parseResult.success) {
//       return next(parseResult.error);
//     }
//     //sanitizing the data

//     req.body = parseResult.data;
//     next();
//   };
// };


import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (ZodSchema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Default to an empty object if req.body is undefined
      let validationData = req.body || {};

      // 2. If it's form-data and the text payload is inside the 'data' field, parse it
      if (req.body && typeof req.body.data === "string") {
        validationData = JSON.parse(req.body.data);
      }

      // 3. Validate the data
      const parseResult = await ZodSchema.safeParseAsync(validationData);

      if (!parseResult.success) {
        return next(parseResult.error);
      }

      // 4. Overwrite req.body with the clean data
      req.body = parseResult.data;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
