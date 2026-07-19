import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Blog title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Slug path is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, "Blog content body is required"],
  },
  thumbnail: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    trim: true,
    default: "Uncategorized",
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientUser", // ✨ Updated reference name
      default: []
    }
  ],
   seo: {
    seoTitle: {
      type: String,
      default: ""
    },

    seoDescription: {
      type: String,
      default: ""
    },

    canonical: {
      type: String,
      default: ""
    },

    schemaMarkup: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientUser", 
        required: true
      },
      message: {
        type: String,
        required: [true, "Comment message body cannot be empty"],
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  published: {
    type: Boolean,
    default: true,
  },
  tableOfContents: {
    type: [{
      id: Number,
      text: String
    }],
    default: []
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: [true, "A valid clientId is required to publish a blog post"],
  },
  tags: {
    type: [String],
    default: [],
  }
}, { 
  strict: true, 
  timestamps: true 
});

blogSchema.index({ title: "text", content: "text", category: "text", tags: "text" });

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);