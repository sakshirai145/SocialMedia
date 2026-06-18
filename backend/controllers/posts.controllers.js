import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js"; 

export const activeCheck = (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

export const createPost = async (req, res) => {
  try {
    const token = req.body.token;

    console.log("REQ BODY:", req.body);
    console.log("TOKEN:", token);

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.body.body) {
      return res.status(400).json({ message: "Post body is required" });
    }

    const post = new Post({
      userId: user._id, 
      body: req.body.body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();

    return res.status(200).json({
      message: "Post created successfully",
      post,
    });

  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, postId } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);

    return res.json({ message: "Post deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCommentsByPost = async (req, res) => {
  const { postId } = req.query; 

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId })
      .populate("userId", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.json({ comments });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { token, commentId } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.json({ message: "Comment deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  const { token, postId, body } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = new Comment({
      userId: user._id,
      postId: post._id,
      body,
    });
    await newComment.save();

    const populated = await Comment.findById(newComment._id)
      .populate("userId", "name username profilePicture");

    return res.status(200).json({ message: "Comment added", comment: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const incrementLikes = async (req, res) => {
  const { postId, token } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!post.likedBy) post.likedBy = [];

    const alreadyLiked = post.likedBy.some(
      (id) => id.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== user._id.toString()
      );
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(user._id);
      post.likes += 1;
    }

    await post.save();

    return res.json({ message: alreadyLiked ? "Post unliked" : "Post liked", post });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
