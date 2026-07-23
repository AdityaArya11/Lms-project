import express from "express";
import { protectUser } from "../middlewares/authmiddleware.js";
import {
    getUserData,
    userEnrolledCourses,
    purchaseCourse,
    updateCourseProgress,
    getUserCourseProgress,
    addUserRating
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", protectUser, getUserData);
userRouter.get("/enrolled-courses", protectUser, userEnrolledCourses);
userRouter.post("/purchase", protectUser, purchaseCourse);
userRouter.post('/update-course-progress', protectUser, updateCourseProgress);
userRouter.post('/get-course-progress', protectUser, getUserCourseProgress);
userRouter.post('/add-rating', protectUser, addUserRating);

export default userRouter;