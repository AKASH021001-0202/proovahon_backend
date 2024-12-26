import express from "express";
import { Usermodel } from "../../db.utils/model.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";  
import {transport } from "../../mail.util.js"

dotenv.config();

const RegisterRouter = express.Router();



RegisterRouter.post("/", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Input validation
    if (!email || !phone || !password || !name) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, and password are required" });
    }

    // Check if the user already exists
    const existUser = await Usermodel.findOne({ email });
    if (existUser) {
      return res.status(200).json({ message: "User already exists" });  // Return to stop further execution
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new Usermodel({
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: false,
    });

    // Generate activation token and expiration time
    const activationToken = crypto.randomBytes(20).toString('hex');
    user.activationToken = activationToken;
    user.activationExpires = Date.now() + 3600000; // 1 hour

    // Save the user to the database
    await user.save();

    // Create the activation link
    const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;

    // Define email options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Account Activation',
      text: `Please click the following link to activate your account: ${activationLink}`,
    };

    // Send activation email
    await transport.sendMail(mailOptions);

    // Respond with success message
    res.status(200).json({ msg: 'Activation email sent', email: user.email });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default RegisterRouter;
