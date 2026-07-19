import mongoose from "mongoose";
import clientUserModel from "../models/client-user-model/index.js";
// import ClientUser from "../models/client-user.model.js";
import connectDB from "../config/db.js";

const syncBlogIds = async () => {
  try {
    await connectDB();

    const blogs = await mongoose.connection.db
      .collection("blogs")
      .find({})
      .toArray();

    const users = await clientUserModel.find();

    for (const user of users) {
      const blogIds = blogs
        .filter(
          (blog) => blog.clientId?.toString() === user._id.toString()
        )
        .map((blog) => blog._id);

      await clientUserModel.findByIdAndUpdate(user._id, {
        $set: { blogIds },
      });
    }

    // console.log("✅ Blog IDs synced successfully");
  } catch (err) {
    // console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

syncBlogIds();