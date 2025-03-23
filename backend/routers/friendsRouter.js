import { Router } from "express";
import { allFriends } from "../controllers/friendsController.js";
import verifyToken from "../middleware/auth.js";
const router = Router();

router.get("/friend", verifyToken,allFriends);

export default router;
