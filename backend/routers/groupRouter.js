import { Router } from "express";
import { storeMessage, getAllMessages, groupFriends, removeGroupUser, addGroupUser, adminModify, addGroup, getUserGroupInformation, getSingleGroupInformation, deleteGroup, } from "../controllers/groupController.js";
import verifyToken from "../middleware/auth.js";
const router = Router();


router.post("/group/message",verifyToken, storeMessage);
router.get("/group/message",verifyToken ,getAllMessages);


router.get("/group/friends/list",verifyToken, groupFriends);
router.delete("/group/friends/remove",verifyToken, removeGroupUser);
router.post("/group/friends/add",verifyToken, addGroupUser);

router.put("/group/admin/modify/",verifyToken, adminModify);


router.post("/group/create",verifyToken, addGroup);
router.get("/user/group/list",verifyToken, getUserGroupInformation);
router.get("/group/:id",verifyToken, getSingleGroupInformation);
router.delete("/group/:id",verifyToken, deleteGroup);
// Admin

export default router;
