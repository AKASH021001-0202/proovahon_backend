import express from 'express';
import { Usermodel } from '../../db.utils/model.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const LoginRouter = express.Router();



LoginRouter.post("/", async (req, res) => { // Added comma here
  const { email, password } = req.body;

  try {
    const user = await Usermodel.findOne({ email });

    if (!user) { // Check for user instead of email
      return res.status(404).json({ message: "User not found" }); // Added return
    }

    if (!user.isActive) {
      return res.status(400).json({ msg: 'Please activate your account' });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Use bcrypt.compare with await

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" }); // Added return
    }

    if (!process.env.JWT_SECRET) { // Ensure JWT_SECRET is set
      return res.status(500).json({ msg: "JWT secret is not defined in environment variables" });
    }
 
    const token = jwt.sign({ userId: user._id , role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Generated Token:", token);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default LoginRouter;