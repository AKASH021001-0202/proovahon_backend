import express from "express";
import { Usermodel } from "../../db.utils/model.js";

const ActivateRouter = express.Router();

ActivateRouter.get("/:token", async (req, res) => {
  const { token } = req.params;
  console.log('Received Token:', token);

  try {
    // Find the user by activation token
    const user = await Usermodel.findOne({ activationToken: token });
    if (!user) {
      return res.status(400).json({ msg: "Activation token is invalid or has expired" });
    }

    // Debug: Check if the token has expired
    console.log('Token Expires At:', user.activationTokenExpires);
    console.log('Current Time:', new Date());
    
    if (user.activationTokenExpires && new Date() > user.activationTokenExpires) {
      return res.status(400).json({ msg: "Activation token is invalid or has expired" });
    }

    // Activate the user's account
    user.isActive = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    await user.save();

    res.json({ msg: "Account activated successfully" });
  } catch (error) {
    console.error("Activation error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default ActivateRouter;
