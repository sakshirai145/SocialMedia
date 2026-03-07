
import profile from "../models/profile.model.js";
import user from "../models/user.model.js";

import bcrypt from "bcrypt";


export const activeCheck = (req, res) => {
  return res.status(200).json({ message :"RUNNING" })
}
