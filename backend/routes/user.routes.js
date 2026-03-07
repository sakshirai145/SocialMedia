import express from "express";
import multer from "multer";

import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserProfile,
  updateProfileData,
  getAllUserProfile
} from "../controllers/user.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// routes

router.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);

router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);

router.get("/get_user_and_profile", getUserProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/get_all_user_profile", getAllUserProfile);
router.route("/user/download_resume");

export default router;