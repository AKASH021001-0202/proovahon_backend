import express from 'express';
import bcrypt from 'bcryptjs';
import { transport } from '../../mail.util.js';
import { Usermodel } from '../../db.utils/model.js';
import Joi from 'joi'; // Adding Joi for input validation

const ResetPassword = express.Router();

// Define a schema for validating the input
const schema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

ResetPassword.post('/', async (req, res) => {
  // Validate input
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { token, newPassword } = req.body;

  try {
    // Find user by reset token and ensure it's not expired
    const user = await Usermodel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear the reset token and expiry
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Send password reset confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Your password has been successfully reset.',
    };

    await transport.sendMail(mailOptions);

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
});

export default ResetPassword;
