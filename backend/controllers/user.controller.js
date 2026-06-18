import mongoose from "mongoose";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture");

    const posts = await Post.find({ userId: user._id })
      .populate("userId", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.json({
      user: { _id: user._id, name: user.name, username: user.username, profilePicture: user.profilePicture },
      profile,
      posts
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/"+outputPath);
  doc.pipe(stream);
  

  doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 100 });
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

export const uploadCoverPicture = async (req, res) => {
  const { token } = req.headers;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    profile.coverPicture = req.file.filename;
    await profile.save();
    return res.json({ message: "Cover picture uploaded successfully", coverPicture: req.file.filename });
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
    const { username, email } = newUserData;
    const query = [];

    if (username) {
      query.push({ username });
    }

    if (email) {
      query.push({ email });
    }

    const existingUser = query.length
      ? await User.findOne({ $or: query })
      : null;

    if (existingUser){
      if(String(existingUser._id) !== String(user._id)){
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

    const postCount = await Post.countDocuments({ userId: user._id });
    const connectionCount = await ConnectionRequest.countDocuments({
      $or: [
        { userId: user._id, status_accepted: true },
        { connectionId: user._id, status_accepted: true }
      ]
    });

    const result = profile ? profile.toObject() : {};
    console.log("STEP3d backend getUserProfile", { docSkills: profile?.skills, resultSkillsBeforeDefault: result.skills });
    result.skills = result.skills || [];
    result.interests = result.interests || [];
    result.education = result.education || [];
    result.postwork = result.postwork || [];
    result.growthJourney = result.growthJourney || [];
    result.bio = result.bio || "";
    result.headline = result.headline || "";
    result.dateOfBirth = result.dateOfBirth || "";
    result.coverPicture = result.coverPicture || "";
    result.postCount = postCount;
    result.connectionCount = connectionCount;

    return res.json(result);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateProfileData = async (req , res) => {
  try{

    const token = req.headers.token;
    const newProfileData = req.body;

    console.log("STEP3c backend updateProfileData", { newProfileData, skills: newProfileData.skills });

    const userProfile = await User.findOne({ token });

    if(!userProfile){
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({ userId: userProfile._id });
    console.log("BEFORE set - skills:", profile_to_update.skills);
    console.log("BEFORE set - interests:", profile_to_update.interests);

    profile_to_update.set(newProfileData);

    console.log("AFTER set - skills:", profile_to_update.skills);
    console.log("AFTER set - interests:", profile_to_update.interests);
    console.log("Modified paths:", profile_to_update.modifiedPaths());

    await profile_to_update.save();
    console.log("AFTER save - skills:", profile_to_update.skills);
    console.log("AFTER save - interests:", profile_to_update.interests);

    return res.json({ message: "Profile updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try{
    const { excludeUserId } = req.query;
    const filter = {};
    if (excludeUserId) {
      filter.userId = { $ne: excludeUserId };
    }
    const profiles = await Profile.find(filter).populate('userId', 'name username email profilePicture');
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id}).populate('userId','name username email profilePicture');

  if (!userProfile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const outputPath = await convertUserDataTOPDF(userProfile);

  return res.json({"message": outputPath});
}

export const sendConnectionRequests = async (req, res) => {

        const {token, connectionId} = req.body;

        try{
          const user = await User.findOne({ token});
          if(!user){
            return res.status(404).json({message: "User not found"})
          }
          const connection = await User.findOne({_id: connectionId});
          if(!connection){
            return res.status(404).json({message: "Connection User not found"})
          }

          if (user._id.toString() === connection._id.toString()) {
            return res.status(400).json({message: "Cannot send request to yourself"})
          }

          const existingRequest = await ConnectionRequest.findOne(
            {
              $or: [
                { userId: user._id, connectionId: connection._id },
                { userId: connection._id, connectionId: user._id }
              ]
            }
          )
          if (existingRequest) {
            if (existingRequest.status_accepted === true) {
              return res.status(400).json({message: "Already connected"})
            }
            if (existingRequest.status_accepted === null) {
              return res.status(400).json({message: "Connection request already pending"})
            }
            existingRequest.status_accepted = null;
            await existingRequest.save();
            return res.json({message: "Connection request re-sent"})
          }

          const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connection._id
          })

          await request.save();

          return res.json({message: "Request Sent"})
        }
        catch(error){
          return res.status(500).json({message: error.message})
}

 }

export const getConnectionRequests = async (req , res) => {

  const {token} = req.body;

  try{
    const user = await User.findOne({ token});

    if(!user){
      return res.status(404).json({message: "User not found"})
    }

    const connections = await ConnectionRequest.find({ userId: user._id})
    .populate('connectionId','name username email profilePicture');

    return res.json({connections});
  }
  catch(error){
    return res.status(500).json({message: error.message})
  }

}

export const whatAreMyConnections = async (req , res) => {

  const {token} = req.body;

  try{
    const user = await User.findOne({ token});

    if(!user){
      return res.status(404).json({message: "User not found"})
    }

    const connections = await ConnectionRequest.find({ connectionId: user._id})
     .populate('userId','name username email profilePicture');

     return res.json(connections);
  }
  catch(error){
    return res.status(500).json({message: error.message})
  }

}

export const acceptConnectionRequests = async (req, res) => {

  const {token, requestId, action_type} = req.body;

  try{
    const user = await User.findOne({ token});
    if(!user){
      return res.status(404).json({message: "User not found"})
    }

    const connection = await ConnectionRequest.findOne({_id: requestId});
    
    if(!connection){
      return res.status(404).json({message: "Connection not found"})
    }

    if (connection.connectionId.toString() !== user._id.toString()) {
      return res.status(403).json({message: "Not authorized to respond to this request"})
    }

    if(action_type === "accept"){
      connection.status_accepted = true;
      await connection.save();
    } else if (action_type === "reject") {
      connection.status_accepted = false;
      await connection.save();
    } else {
      return res.status(400).json({message: "Invalid action type"})
    }

    return res.json({message: "Request updated"})
  } catch(error){
    return res.status(500).json({message: error.message})
  }
}

export const cancelConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  console.log("[CANCEL DBG 3] Route hit. req.body:", JSON.stringify(req.body));
  console.log("[CANCEL DBG 3a] token:", token ? token.slice(0, 8) + "..." : "null", "connectionId:", connectionId, "typeof:", typeof connectionId);
  try {
    const user = await User.findOne({ token });
    console.log("[CANCEL DBG 3b] User lookup result:", user ? `found ${user._id.toString()}` : "NOT FOUND");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[CANCEL DBG 3b2] logged-in user._id:", user._id.toString());
    console.log("[CANCEL DBG 3b3] connectionId from body:", connectionId, "typeof:", typeof connectionId);

    const query = {
      userId: user._id,
      connectionId,
      status_accepted: null
    };
    console.log("[CANCEL DBG 3c] Mongo query - userId:", user._id.toString(), "connectionId:", connectionId, "status_accepted: null");
    console.log("[CANCEL DBG 3c2] query JSON:", JSON.stringify({
      userId: user._id.toString(),
      connectionId: connectionId,
      status_accepted: null
    }));
    const request = await ConnectionRequest.findOneAndDelete(query);

    console.log("[CANCEL DBG 3d] findOneAndDelete result:", request ? `FOUND ${request._id.toString()}` : "NULL (not found)");
    if (request) {
      console.log("[CANCEL DBG 3e] Deleted doc userId:", request.userId.toString(), "connectionId:", request.connectionId.toString(), "status_accepted:", request.status_accepted);
    } else {
      // Debug: search for any matching documents
      const allPending = await ConnectionRequest.find({ userId: user._id, status_accepted: null }).lean();
      console.log("[CANCEL DBG 3f] All pending outgoing docs for this user:", JSON.stringify(allPending.map(d => ({
        _id: d._id.toString(),
        userId: d.userId.toString(),
        connectionId: d.connectionId.toString(),
        status_accepted: d.status_accepted
      }))));
    }

    if (!request) {
      return res.status(404).json({ message: "Pending request not found or already cancelled" });
    }

    return res.json({ message: "Request cancelled" });
  } catch (error) {
    console.error("[CANCEL DBG 3x] Server error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const removeConnection = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await ConnectionRequest.findOneAndDelete({
      $or: [
        { userId: user._id, connectionId, status_accepted: true },
        { userId: connectionId, connectionId: user._id, status_accepted: true }
      ]
    });

    if (!result) {
      return res.status(404).json({ message: "Connection not found or already removed" });
    }

    return res.json({ message: "Connection removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const token = req.headers.token;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ userId: user._id })
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res ) => {
  const { token, post_id, commentBody} = req.body;

  try{
    const user = await User.findOne({token: token});
    if(!user){
      return res.status(404).json({message: "User not found"})
    }

    const post = await Post.findOne({_id: post_id});
    if(!post){
      return res.status(404).json({message: "Post not found"})
    }

    const newComment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody
    });

    await newComment.save();

    return res.status(200).json({message: "Comment added successfully"})

  } catch(error){
    return res.status(500).json({message: error.message})
  }
}

export const getMutualConnections = async (req, res) => {
  try {
    const token = req.headers.token;
    const { targetUserId } = req.params;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

    const mutualConnections = await ConnectionRequest.aggregate([
      {
        $match: {
          $or: [
            { userId: user._id, status_accepted: true },
            { connectionId: user._id, status_accepted: true }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ["$userId", user._id] },
              "$connectionId",
              "$userId"
            ]
          }
        }
      },
      {
        $match: {
          otherUser: { $nin: [user._id, targetObjectId] }
        }
      },
      {
        $group: {
          _id: "$otherUser"
        }
      },
      {
        $project: {
          otherUser: "$_id",
          _id: 0
        }
      },
      {
        $lookup: {
          from: "connectionrequests",
          let: { candidate: "$otherUser" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$status_accepted", true] },
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$userId", targetObjectId] },
                            { $eq: ["$connectionId", "$$candidate"] }
                          ]
                        },
                        {
                          $and: [
                            { $eq: ["$connectionId", targetObjectId] },
                            { $eq: ["$userId", "$$candidate"] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: "connectionToTarget"
        }
      },
      {
        $match: {
          "connectionToTarget.0": { $exists: true }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "otherUser",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          username: "$userInfo.username",
          profilePicture: "$userInfo.profilePicture"
        }
      }
    ]);

    return res.json({
      count: mutualConnections.length,
      users: mutualConnections
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
