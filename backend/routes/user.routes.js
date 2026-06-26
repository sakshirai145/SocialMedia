import express from "express";
import multer from "multer";
import path from "path";

import {
  register,
  login,
  logout,
  uploadProfilePicture,
  uploadCoverPicture,
  updateUserProfile,
  getUserProfile,
  updateProfileData,
  sendConnectionRequests,
  getAllUserProfile,
  downloadProfile,
  getConnectionRequests,
  whatAreMyConnections,
  acceptConnectionRequests,
  cancelConnectionRequest,
  removeConnection,
  getMyPosts,
  getProfileByUsername,
  getMutualConnections
} from "../controllers/user.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + ext);
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// routes

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post(
  "/update_profile_picture",
  (req, res, next) => {
    upload.single("profile_picture")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "File too large. Maximum size is 20MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadProfilePicture
);

router.post(
  "/update_cover_picture",
  (req, res, next) => {
    upload.single("cover_picture")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "File too large. Maximum size is 20MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadCoverPicture
);

router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/get_all_user_profile", getAllUserProfile);
router.get("/user/download_resume", downloadProfile);

router.post("/user/send_connection_request", sendConnectionRequests);
router.post("/user/get_connection_requests", getConnectionRequests);
router.post("/user/my_connections", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequests);
router.post("/user/cancel_connection_request", cancelConnectionRequest);
router.post("/user/remove_connection", removeConnection);
router.get("/user/mutual_connections/:targetUserId", getMutualConnections);
router.get("/user/my_posts", getMyPosts);
router.get("/get_profile_by_username", getProfileByUsername);

export default router;