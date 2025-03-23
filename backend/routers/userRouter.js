import { Router } from "express";
import { signup, login } from "../controllers/userController.js";
const router = Router();

router.post("/user/signup", signup);
router.post("/user/login", login);
export default router;
