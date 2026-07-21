import express from "express";
import { requireAuth } from "@clerk/express";
import { updateRoleToEducator } from "../controllers/educatorController.js";

const EducatorRouter = express.Router();

EducatorRouter.get("/update-role", requireAuth(), updateRoleToEducator);

export default EducatorRouter;