import { Router } from "express";
import multer from "multer";
import {
  createPost,
  activeCheck,
  getAllPosts,
  deletePost,
  getCommentsByPost,
  createComment,
  deleteComment,
  incrementLikes
} from "../controllers/posts.controllers.js";

const router = Router();

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});


router.get("/", activeCheck);

// create post
router.post("/post", (req, res, next) => {
  upload.single("media")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large. Maximum size is 20MB." });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createPost);

// get all posts
router.get("/all", getAllPosts);

// delete post
router.post("/delete", deletePost);

// get comments (GET → query param)
router.get("/comments", getCommentsByPost);

// create comment
router.post("/comment", createComment);

// delete comment
router.delete("/comment", deleteComment);

// like post
router.post("/like", incrementLikes);

export default router;