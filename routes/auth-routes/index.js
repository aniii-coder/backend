import { Router } from "express";
import { loginController, loginViaGoogleController, signupController } from "../../controllers/auth-controller/index.js";

const router = Router();


router.post("/login", loginController);
router.post("/register", signupController);
router.post("/g_auth", loginViaGoogleController)

export default router;