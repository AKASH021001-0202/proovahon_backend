import express from "express";
import { Usermodel } from "../../db.utils/model.js"; 
import crypto from "crypto";
import { transport } from "../../mail.util.js"; // Make sure you have a configured transport for sending emails

const ResendRouter = express.Router();

ResendRouter.post("/", async (req, res) => {
    const { email } = req.body;
    console.log("Received request to resend activation link for:", email);

    try {
        const user = await Usermodel.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(404).json({ msg: "User not found." });
        }

        console.log("User found, generating new activation token.");
        const newActivationToken = crypto.randomBytes(32).toString("hex");
        const newActivationTokenExpires = Date.now() + 3600000; // Token valid for 1 hour

        // Update user document with new token and expiration
        user.activationToken = newActivationToken; // Make sure the field name matches your schema
        user.activationTokenExpires = newActivationTokenExpires; // Make sure the field name matches your schema
        await user.save();
        console.log("New activation token generated and saved.");

        const activationLink = `${process.env.FRONTEND_URL}/activate/${newActivationToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Account Activation',
            text: `Please click the following link to activate your account: ${activationLink}`,
        };

        try {
            await transport.sendMail(mailOptions);
            console.log("Activation email sent successfully.");
            return res.status(200).json({ msg: "Activation link resent. Please check your email." });
        } catch (mailError) {
            console.error("Error sending email:", mailError);
            return res.status(500).json({ msg: "Failed to send activation link." });
        }
    } catch (error) {
        console.error("Error resending activation link:", error);
        return res.status(500).json({ msg: "Failed to resend activation link." });
    }
});

export default ResendRouter;
