import express from "express";
import jwt from "jsonwebtoken";
import { Usermodel } from "../../db.utils/model.js";

const LoginRouter = express.Router();

LoginRouter.post("/", async (req, res) => {
  const { phone } = req.body;  // Only the phone number is expected

  try {
    // Check if user with the provided phone exists
    const user = await Usermodel.findOne({ phone });

    if (!user) {
      return res.status(401).json({ msg: "User not found", code: 1 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET);

    // Return token and success message along with user ID
    return res.status(200).json({ msg: "Login successful", code: 0, token, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error", code: 3 });
  }
});

// Middleware to set Cache-Control header
LoginRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

export default LoginRouter;
