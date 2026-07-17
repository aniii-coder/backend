import { Router } from "express";
import { loginController, signupController } from "../../controllers/auth-controller/index.js";

const router = Router();


router.post("/login", loginController);
router.post("/register", signupController);

export default router;