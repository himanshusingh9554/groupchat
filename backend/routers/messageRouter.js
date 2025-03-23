import { Router } from "express";
import { storeMessage, getAllMessages } from "../controllers/messageController.js";
import verifyToken from "../middleware/auth.js";
const router = Router();


router.post("/message", verifyToken,storeMessage);

router.post("/message/all", verifyToken,getAllMessages);
export default router;
