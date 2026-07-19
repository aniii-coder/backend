import mongoose from "mongoose";
import clientUserModel from "../../models/client-user-model/index.js";
import blogModel from "../../models/blog-model/index.js";


// import blogModel from "../../models/blog-model/index.js";

export const getAllBlogsServices = async ({
  search = "",
  limit = 10,
  offset = 0,
  sort = "views",
  category,
  published,
}) => {
  const parsedLimit = Number(limit) || 10;
  const parsedOffset = Number(offset) || 0;

  const matchStage = {};

  if (search) {
    matchStage.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    matchStage.category = category;
  }

  if (published !== undefined) {
    matchStage.published = published === "true";
  }

  let sortStage = {};

  switch (sort) {
    case "views":
      sortStage = { views: -1 };
      break;

    case "likes":
      sortStage = { likesCount: -1 };
      break;

    case "comments":
      sortStage = { commentsCount: -1 };
      break;

    case "oldest":
      sortStage = { createdAt: 1 };
      break;

    case "az":
      sortStage = { title: 1 };
      break;

    case "za":
      sortStage = { title: -1 };
      break;

    case "newest":
    default:
      sortStage = { createdAt: -1 };
      break;
  }

  const [blogs, total, analyticsResult] = await Promise.all([

    blogModel.aggregate([
      { $match: matchStage },

      {
        $addFields: {
          likesCount: {
            $cond: [
              { $isArray: "$likes" },
              { $size: "$likes" },
              0,
            ],
          },

          commentsCount: {
            $cond: [
              { $isArray: "$comments" },
              { $size: "$comments" },
              0,
            ],
          },
        },
      },

      { $sort: sortStage },

      { $skip: parsedOffset },

      { $limit: parsedLimit },

      {
        $project: {
          title: 1,
          description: 1,
          slug: 1,
          thumbnail: 1,
          banner: 1,
          category: 1,
          published: 1,
          views: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          commentsCount: 1,
        },
      },
    ]),

    // ================= TOTAL COUNT =================
    blogModel.countDocuments(matchStage),

    // ================= ANALYTICS =================
    blogModel.aggregate([
      { $match: matchStage },

      {
        $addFields: {
          likesCount: {
            $cond: [
              { $isArray: "$likes" },
              { $size: "$likes" },
              0,
            ],
          },

          commentsCount: {
            $cond: [
              { $isArray: "$comments" },
              { $size: "$comments" },
              0,
            ],
          },
        },
      },

      {
        $group: {
          _id: null,

          totalBlogs: {
            $sum: 1,
          },

          totalViews: {
            $sum: "$views",
          },

          totalLikes: {
            $sum: "$likesCount",
          },

          totalComments: {
            $sum: "$commentsCount",
          },

          publishedBlogs: {
            $sum: {
              $cond: ["$published", 1, 0],
            },
          },

          draftBlogs: {
            $sum: {
              $cond: ["$published", 0, 1],
            },
          },
        },
      },
    ]),
  ]);

  return {
    analytics:
      analyticsResult[0] || {
        totalBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
      },

    blogs,

    pagination: {
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      hasMore: parsedOffset + parsedLimit < total,
    },
  };
};

export const deleteBlogService = async (blogId) => {
  // Validate that the ID is a valid 24-character hex string before casting to prevent Mongoose crashes
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    const error = new Error("Invalid Blog ID format provided.");
    error.statusCode = 400;
    throw error;
  }

  const targetBlogId = new mongoose.Types.ObjectId(blogId);

  // Query finds the blog strictly by its ID, ignoring who owns it
  const blog = await blogModel.findById(targetBlogId);

  if (!blog) {
    const error = new Error("Requested blog post not found.");
    error.statusCode = 404; // Sent down to your global error handler middleware
    throw error;
  }

  // Delete the post safely from the collection
  await blogModel.deleteOne({ _id: targetBlogId });
  
  return blog;
};




export const getSpecificBlogService = async (identifier) => {
  try {
    await blogModel.findOneAndUpdate(
      { _id: identifier },
      { $inc: { views: 1 } }
    );

    const blog = await blogModel.findById(identifier)
      .populate({
        path: 'comments.userId',
        select: 'name' 
      });

      console.log('blog :>> ', blog);

    return blog;
  } catch (error) {
    throw error;
  }
};

export const createBlogService = async (blogDataPayload) => {
  try {
    // 1. Double check against duplicate route creation anomalies using blogModel
    const existingBlog = await blogModel.findOne({ slug: blogDataPayload.slug });
    if (existingBlog) {
      return null;
    }
    console.log('blogDataPayload :>> ', blogDataPayload);
    const newBlog = await blogModel.create({
      ...blogDataPayload,
      views: blogDataPayload.views || 0,
      likes:  [],
      comments: []
    });
    console.log('object :>> ', newBlog);
    return newBlog;

  } catch (error) {
    // Gracefully handle race-condition duplicate key errors (Mongo Server Error 11000)
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};





export const updateBlogService = async (blogId, blogDataPayload) => {
  try {
    const currentBlog = await blogModel.findById(blogId);
    if (!currentBlog) {
      return null;
    }

    if (blogDataPayload.slug && blogDataPayload.slug !== currentBlog.slug) {
      const slugDuplicateCheck = await blogModel.findOne({ slug: blogDataPayload.slug.toLowerCase() });
      if (slugDuplicateCheck && slugDuplicateCheck._id.toString() !== blogId) {
        return null; 
      }
    }

    const finalThumbnail = blogDataPayload.thumbnail || currentBlog.thumbnail;
    const finalBanner = blogDataPayload.banner || currentBlog.banner;

    const consolidatedSEO = {
      seoTitle: blogDataPayload.seo.seoTitle !== undefined ? blogDataPayload.seo.seoTitle : currentBlog.seo.seoTitle,
      seoDescription: blogDataPayload.seo.seoDescription !== undefined ? blogDataPayload.seo.seoDescription : currentBlog.seo.seoDescription,
      canonical: blogDataPayload.seo.canonical !== undefined ? blogDataPayload.seo.canonical : currentBlog.seo.canonical,
      schemaMarkup: blogDataPayload.seo.schemaMarkup !== undefined ? blogDataPayload.seo.schemaMarkup : currentBlog.seo.schemaMarkup
    };

    const executionPayload = {
      title: blogDataPayload.title !== undefined ? blogDataPayload.title : currentBlog.title,
      description: blogDataPayload.description !== undefined ? blogDataPayload.description : currentBlog.description,
      slug: blogDataPayload.slug !== undefined ? blogDataPayload.slug.toLowerCase() : currentBlog.slug,
      content: blogDataPayload.content !== undefined ? blogDataPayload.content : currentBlog.content,
      category: blogDataPayload.category !== undefined ? blogDataPayload.category : currentBlog.category,
      clientId: blogDataPayload.clientId !== undefined ? blogDataPayload.clientId : currentBlog.clientId,
      tags: blogDataPayload.tags !== undefined ? blogDataPayload.tags : currentBlog.tags,
      tableOfContents: blogDataPayload.tableOfContents !== undefined ? blogDataPayload.tableOfContents : currentBlog.tableOfContents,
      published: blogDataPayload.published !== undefined ? blogDataPayload.published : currentBlog.published,
      thumbnail: finalThumbnail,
      banner: finalBanner,
      seo: consolidatedSEO
    };

    const updatedDocument = await blogModel.findByIdAndUpdate(
      blogId,
      { $set: executionPayload },
      { 
        new: true, 
        runValidators: true, 
        context: 'query' 
      }
    );

    return updatedDocument;

  } catch (error) {
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};




export const likeBlogService = async (identifier, userId) => {
  const hasLiked = await blogModel.exists({ _id: identifier, likes: userId });

  let updatedBlog;

  if (!hasLiked) {
    // 2a. If not liked yet, atomically add ($addToSet ensures uniqueness) the user ID
    updatedBlog = await blogModel.findByIdAndUpdate(
      identifier,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  } else {
    // 2b. If already liked, atomically remove ($pull) the user ID
    updatedBlog = await blogModel.findByIdAndUpdate(
      identifier,
      { $pull: { likes: userId } },
      { new: true }
    );
  }

  if (!updatedBlog) return null;

  return {
    blog: updatedBlog,
    hasLiked: !hasLiked 
  };
};





export const addCommentService = async (blogId, userId, message) => {
  const updatedBlog = await blogModel.findByIdAndUpdate(
    blogId,
    {
      $push: {
        comments: { userId, message }
      }
    },
    { new: true } // Returns the updated state payload
  ).populate("comments.userId", "name email"); // Optional: expands user info in response

  return updatedBlog;
};