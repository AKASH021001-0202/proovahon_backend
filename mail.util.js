
import nodemailer from 'nodemailer';
import dotenv from "dotenv";


dotenv.config();



// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'process.env.GMAIL_USER', // Your email
    pass: 'process.env.GMAIL_PASS',   // Your email password (use app-specific password for Gmail)
  },
});

// Send OTP via email
export const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: 'process.env.GMAIL_USER',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP to ${email}: ${error.message}`);
  }
};
