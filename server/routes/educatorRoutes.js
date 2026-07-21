import express from "express";
import { 
    updateRoleToEducator, 
    addCourse, 
    getEducatorCourses, 
    getEducatorDashboardData, 
    getEnrolledStudentsData 
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authmiddleware.js";

const EducatorRouter = express.Router();

EducatorRouter.get("/update-role", updateRoleToEducator);
EducatorRouter.post("/add-course", protectEducator, upload.single('image'), addCourse);
EducatorRouter.get("/courses", protectEducator, getEducatorCourses);
EducatorRouter.get("/dashboard", protectEducator, getEducatorDashboardData);
EducatorRouter.get("/enrolled-students", protectEducator, getEnrolledStudentsData);

export default EducatorRouter;