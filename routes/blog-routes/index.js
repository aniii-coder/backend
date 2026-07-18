import { Router } from "express";
import { getAllClientsController } from "../../controllers/client/index.js";
import { getAllBlogs } from "../../controllers/blog-controller/index.js";

const router = Router();
console.log("Blog router loaded");

// router.get("/getAll", (req, res) => {
//     console.log("Hit /blogs/getAll");
//     res.send("Working");
// });
router.get("/getAll",  getAllBlogs)
export default router;