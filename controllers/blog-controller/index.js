import { login, loginViaGoogle, signup } from "../../services/auth-services/index.js";
import { getAllBlogsServices } from "../../services/blog-services/index.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const {
      search = "",
      limit = 10,
      offset = 0,
      sort = "newest",
      category,
    } = req.query;

    const blogs = await getAllBlogsServices({
      search,
      limit: Number(limit),
      offset: Number(offset),
      sort,
      category,
    });

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      ...blogs,
    });
  } catch (error) {
    next(error);
  }
};