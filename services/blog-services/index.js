
import mongoose from "mongoose";
import clientUserModel from "../../models/client-user-model/index.js";

// import mongoose from "mongoose";

export const getAllBlogsServices = async ({
  search = "",
  limit = 10,
  offset = 0,
  sort = "newest",
  category,
}) => {
  const collection = mongoose.connection.db.collection("blogs");

  const filter = {};

  // Search by title or description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Optional category filter
  if (category) {
    filter.category = category;
  }

  // Sorting
  let sortQuery = {};

  switch (sort) {
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;

    case "az":
      sortQuery = { title: 1 };
      break;

    case "za":
      sortQuery = { title: -1 };
      break;

    default:
      sortQuery = { createdAt: -1 };
  }

  const [blogs, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sortQuery)
      .skip(offset)
      .limit(limit)
      .toArray(),

    collection.countDocuments(filter),
  ]);

  return {
    data: blogs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};