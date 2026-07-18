import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  // You don't even need to define all the fields here if you're only reading them,
  // but adding a strict: false or basic fields keeps it safe.
}, { strict: false }); 

// This line registers "Blog" into Mongoose's internal memory
export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);