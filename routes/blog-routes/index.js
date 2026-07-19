import { Router } from "express";
import { getAllClientsController } from "../../controllers/client/index.js";
import { addCommentController, deleteBlogController, getAllBlogs, getSpecificBlog, likeBlogController, postBlogController, updateBlogController } from "../../controllers/blog-controller/index.js";
import upload  from "../../middleware/upload-middleware/index.js";
import { authMiddleware } from "../../middleware/auth-middleware/index.js";

const router = Router();
console.log("Blog router loaded");


router.get("/getAll",  getAllBlogs)
router.get("/:id",  getSpecificBlog)
router.patch("/:id/like", authMiddleware, likeBlogController)
router.post("/:id/comment", authMiddleware, addCommentController);
router.delete("/:blog_id",authMiddleware, deleteBlogController);
router.post("/create", (req, res) => {

  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ])(req, res, function(err) {

    console.log("Upload callback");

    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }

    console.log(req.files);

    postBlogController(req, res);
  });


  
  
});
router.put("/update/:blog_id", (req, res) => {
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ])(req, res, function(err) {
    if (err) {
      console.error("Cloudinary upload parsing error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
    
    updateBlogController(req, res);
  });
});

export default router;