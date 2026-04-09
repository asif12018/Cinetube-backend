import { Router } from "express";
import { TagController } from "./tags.controller";



const router = Router();




router.get("/", TagController.getAllTags);


export const TagRoutes = router;