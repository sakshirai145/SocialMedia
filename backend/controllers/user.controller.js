import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/"+outputPath);
  doc.pipe(stream);
  

  doc.image(`uploads/${userData.userId.profilePicture}`,{align: "center", width: 100})
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPosition}`);

  doc.end();

  return outputPath;
};



export const register = async (req, res) => {
  console.log(req.body);
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const newProfile = new Profile({
      userId: newUser._id
    });

    await newProfile.save();

    return res.json({ message: "User Created Successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");

    // save token
    user.token = token;
    await user.save();

    return res.json({
      message: "Login successful",
      token: token
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.headers;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = req.file.filename;
    await user.save();

    return res.json({ message: "Profile picture uploaded successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try{
    const { token , ...newUserData } = req.body;
    const user = await User.findOne({ token: token});
    if(!user){
      return res.status(404).json({ message: "User not found" })

    }
    const {username, email} = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser){
      if(existingUser || String(existingUser._id) !== String(user._id)){
      return res.status(400).json({ message: "Username or email already exists" });
    }
  }

  Object.assign(user, newUserData);
  await user.save();

  return res.json({ message: "User updated successfully" });
  } catch(error){
    return res.status(500).json({ message: error.message });
  }
}

export const getUserProfile = async (req, res) => {
  try {

    const token = req.headers.token;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture");

    return res.json(profile);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateProfileData = async (req , res) => {
  try{

    const token = req.headers.token;
    const newProfileData = req.body;

    const userProfile = await User.findOne({ token });

    if(!userProfile){
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({ userId: userProfile._id });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.json({ message: "Profile updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try{
    const profiles = await Profile.find().populate('userId', 'name username email profilePicture');
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id}).populate('userId','name username email profilePicture');

  let outputPath = await convertUserDataTOPDF(userProfile);

  return res.json({"message": outputPath});
}