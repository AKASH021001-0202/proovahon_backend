import express from 'express';
import { Usermodel } from '../../db.utils/model.js';
const RegisterRouter = express.Router();

// Route for user registration
RegisterRouter.post('/', async (req, res) => {
  const { name, email, phone, agree } = req.body;

  // Basic validation
  if (!name || typeof name !== 'string' || name.length < 3) {
    return res.status(400).json({ message: 'Name must be at least 3 characters long' });
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone must be a 10-digit number' });
  }

  if (agree !== true) {
    return res.status(400).json({ message: 'You must agree to the terms and conditions' });
  }

  try {
    // Check if user already exists by email or phone
    const userExists = await Usermodel.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    // Create a new user
    const newUser = new Usermodel({
      name,
      email,
      phone,
      
    });

    await newUser.save();
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser // Include the user object in the response
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default RegisterRouter;
