import { Router } from "express";
import { getAllClientsController, getSpecificClientController } from "../../controllers/client/index.js";
// import { loginController, loginViaGoogleController, signupController } from "../../controllers/auth-controller/index.js";

const router = Router();


router.get("/getAll",  getAllClientsController);
router.get("/:id",  getSpecificClientController);

// router.post("/login", loginController);
// router.post("/register", signupController);
// router.post("/g_auth", loginViaGoogleController)

export default router;