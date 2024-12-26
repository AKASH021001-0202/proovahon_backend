import express from "express";
import { Usermodel } from "../../db.utils/model.js";
import dotenv from "dotenv";

import { transport } from "../../mail.util.js";

dotenv.config();

const RegisterRouter = express.Router();

// Function to generate a random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST route for user registration
RegisterRouter.post("/", async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    // Input validation
    if (!email || !phone || !name) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required" });
    }

    // Check if the user already exists
    const existUser = await Usermodel.findOne({ email });
    if (existUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    // Generate OTPs for email and phone verification
    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();

    // Create a new user with OTPs
    const user = new Usermodel({
      name,
      email,
      phone,
      emailOTP,
      phoneOTP,
      emailVerified: false,
      phoneVerified: false,
      isActive: false,
    });

    // Save the user to the database
    await user.save();

    // Send email OTP
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is: ${emailOTP}`,
    };
    await transport.sendMail(mailOptions);

    // Send phone OTP (integrate with an SMS service like Twilio)
    console.log(`Phone OTP for ${user.phone}: ${phoneOTP}`); // Replace this with actual SMS sending logic

    // Respond with a success message
    res.status(200).json({ msg: "Verification OTPs sent", email: user.email });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST route for OTP verification
RegisterRouter.post("/verify", async (req, res) => {
  const { email, emailOTP, phoneOTP } = req.body;

  try {
    // Input validation
    if (!email || (!emailOTP && !phoneOTP)) {
      return res.status(400).json({ message: "Email and OTPs are required" });
    }

    // Find the user by email
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify email OTP
    if (emailOTP && user.emailOTP === emailOTP) {
      user.emailVerified = true;
      user.emailOTP = null; // Clear the OTP after verification
    }

    // Verify phone OTP
    if (phoneOTP && user.phoneOTP === phoneOTP) {
      user.phoneVerified = true;
      user.phoneOTP = null; // Clear the OTP after verification
    }

    // Save the updated user
    await user.save();

    // Check if both email and phone are verified
    if (user.emailVerified && user.phoneVerified) {
      user.isActive = true; // Activate the user
      await user.save();
      return res.status(200).json({ msg: "User verified and activated" });
    }

    // Respond with partial verification status
    res.status(200).json({
      msg: "Verification successful for provided OTP(s)",
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default RegisterRouter;
