import express from "express";
import { requireAuth } from "@clerk/express";
import { updateRoleToEducator, addCourse } from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authmiddleware.js";

const EducatorRouter = express.Router();

EducatorRouter.get("/update-role",  updateRoleToEducator);
EducatorRouter.post("/add-course", protectEducator, upload.single('image'), addCourse);

export default EducatorRouter;