import { login, loginViaGoogle, signup } from "../../services/auth-services/index.js";
import { addCommentService, createBlogService, deleteBlogService, getAllBlogsServices, getSpecificBlogService, likeBlogService, updateBlogService } from "../../services/blog-services/index.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const {
      search = "",
      limit = 9,
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
export const deleteBlogController = async (req, res, next) => {
  try {
    const { blog_id } = req.params;

    if (!blog_id) {
      return res.status(400).json({
        success: false,
        message: "Blog post ID parameter is missing from routing endpoint."
      });
    }

    const deletedBlog = await deleteBlogService(blog_id);

    return res.status(200).json({
      success: true,
      message: `Blog post "${deletedBlog.title}" has been successfully removed.`,
      data: { id: blog_id }
    });

  } catch (error) {
    next(error);
  }
};





export const getSpecificBlog = async (req, res, next) => {
  try {
    const { id: identifier } = req.params; 

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Blog identifier parameter is required."
      });
    }

    const blog = await getSpecificBlogService(identifier);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "The requested blog article could not be found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog details retrieved successfully.",
      data: blog
    });
  } catch (error) {
    next(error);
  }
};



export const postBlogController = async (req, res, next) => {
  try {
    // 1. Unpack basic explicit string values from req.body
    const { 
      title, description, slug, content, 
      seoTitle, seoDescription, canonical, schemaMarkup,
      category, published, clientId 
    } = req.body;

    console.log("Incoming fields:", req.body);
    console.log("Incoming files:", req.files);

    // 2. Capture uploaded image asset destination references from Multer
    const thumbnail = req.files?.thumbnail?.[0]?.path || null;
    const banner = req.files?.banner?.[0]?.path || null;

    // 3. FormData Safe Parsing: Only parse if the string is populated and valid JSON
    let tags = [];
    let tableOfContents = [];
    let parsedSchemaMarkup = null;

    try {
      if (req.body.tags && req.body.tags.trim() !== "") {
        tags = JSON.parse(req.body.tags);
      }
      if (req.body.tableOfContents && req.body.tableOfContents.trim() !== "") {
        tableOfContents = JSON.parse(req.body.tableOfContents);
      }
      // 🚀 FIX: Verify the string isn't empty before passing to JSON.parse
      if (req.body.schemaMarkup && req.body.schemaMarkup.trim() !== "") {
        parsedSchemaMarkup = JSON.parse(req.body.schemaMarkup);
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: "Malformed string layout inside fields 'tags', 'tableOfContents', or 'schemaMarkup'." 
      });
    }

    // 4. Consolidate attributes into a clean unified operational payload mapping
    const blogDataPayload = {
      title,
      description,
      slug,
      content,
      thumbnail,
      banner,
      category,
      clientId,
      tags,
      tableOfContents,
      likes: [],
  comments: [],
      published: published === "false" ? false : true, 
      seo: {
        seoTitle,
        seoDescription,
        canonical,
        schemaMarkup: parsedSchemaMarkup || schemaMarkup || null // Clean fallback
      }
    };

    // 5. Transfer operations over to the business data service layer
    const newBlog = await createBlogService(blogDataPayload);

    if (!newBlog) {
      return res.status(409).json({ 
        success: false, 
        message: "A blog post with this URL slug route configuration already exists." 
      });
    }

    return res.status(201).json({ 
      success: true, 
      data: newBlog 
    });

  } catch (error) {
    console.error("Critical Backend Failure:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

export const updateBlogController = async (req, res, next) => {
  console.log("hitttt")
  try {
    const { blog_id } = req.params;

    if (!blog_id) {
      return res.status(400).json({
        success: false,
        message: "Target parameter 'blog_id' is required."
      });
    }

    // 1. Unpack editable fields from req.body (including fallback URL strings)
    const { 
      title, description, slug, content, 
      seoTitle, seoDescription, canonical, schemaMarkup,
      category, published, clientId,
      thumbnail: bodyThumbnail, banner: bodyBanner // If the client sent a URL string back
    } = req.body;

    console.log(`Incoming update fields for ID (${blog_id}):`, req.body);
    console.log("Incoming update files:", req.files);

    // 2. Prioritize a newly uploaded file path (Cloudinary URL). Fall back to the incoming body string.
    const thumbnail = req.files?.thumbnail?.[0]?.path || bodyThumbnail || null;
    const banner = req.files?.banner?.[0]?.path || bodyBanner || null;

    // 3. FormData Safe Parsing matching your architectural layout exactly
    let tags = undefined;
    let tableOfContents = undefined;
    let parsedSchemaMarkup = undefined;

    try {
      if (req.body.tags && req.body.tags.trim() !== "") {
        tags = JSON.parse(req.body.tags);
      }
      if (req.body.tableOfContents && req.body.tableOfContents.trim() !== "") {
        tableOfContents = JSON.parse(req.body.tableOfContents);
      }
      if (req.body.schemaMarkup && req.body.schemaMarkup.trim() !== "") {
        parsedSchemaMarkup = JSON.parse(req.body.schemaMarkup);
      }
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: "Malformed string layout inside fields 'tags', 'tableOfContents', or 'schemaMarkup'." 
      });
    }

    // 4. Consolidate attributes into a clean operational payload mapping
    const blogDataPayload = {
      title,
      description,
      slug,
      content,
      category,
      clientId,
      tags,
      tableOfContents,
      thumbnail, 
      banner,
      published: published !== undefined ? (published === "false" ? false : true) : undefined,
      seo: {
        seoTitle,
        seoDescription,
        canonical,
        schemaMarkup: parsedSchemaMarkup || schemaMarkup
      }
    };

    // 5. Hand execution over to the transactional business service block
    const updatedBlog = await updateBlogService(blog_id, blogDataPayload);

    if (!updatedBlog) {
      return res.status(409).json({ 
        success: false, 
        message: "Action aborted. A conflict exists: either the blog post wasn't found or the new slug path is already taken." 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Blog post updated successfully.",
      data: updatedBlog 
    });

  } catch (error) {
    console.error("Critical Backend Update Failure:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};


export const likeBlogController = async (req, res, next) => {
  try {
    const { id: identifier } = req.params;
    const userId = req.user?.id; 

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Blog identifier parameter is required."
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to like this blog post."
      });
    }

    const updatedBlog = await likeBlogService(identifier, userId);

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "The requested blog article could not be found."
      });
    }

    res.status(200).json({
      success: true,
      message: updatedBlog.hasLiked ? "Blog liked successfully." : "Blog unliked successfully.",
      data: updatedBlog.blog
    });
  } catch (error) {
    next(error);
  }
};



export const addCommentController = async (req, res, next) => {
  try {
    const { id: blogId } = req.params; // blogid from URL route params
    const userId = req.user?.id;       // Extracted from auth middleware cookie validation [cite: 61, 93]
    const { message } = req.body;      // Message payload JSON from the frontend client

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog identifier parameter is required." 
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to leave a comment."
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment message cannot be blank."
      });
    }

    // Execute database operations via the business logic layer
    const updatedBlog = await addCommentService(blogId, userId, message);

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "The requested blog article could not be found." 
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment posted successfully.",
      data: updatedBlog.comments // Returns the updated comments array layout
    });

  } catch (error) {
    next(error); // Pipe errors safely into centralized backend failure handler 
  }
};