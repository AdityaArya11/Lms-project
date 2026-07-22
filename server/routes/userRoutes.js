import express from "express";
import { protectUser } from "../middlewares/authmiddleware.js";
import { getUserData, userEnrolledCourses, purchaseCourse } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", protectUser, getUserData);
userRouter.get("/enrolled-courses", protectUser, userEnrolledCourses);
userRouter.post("/purchase", protectUser, purchaseCourse);

export default userRouter;