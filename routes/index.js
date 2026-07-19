import { Router } from "express";
import authRoutes from './auth-routes/index.js'
import clientRoutes from './client/index.js'
import blogRoutes from './blog-routes/index.js'
const router = Router();

router.use("/auth", authRoutes);
router.use("/client", clientRoutes)
router.use("/blogs", blogRoutes)

export default router;