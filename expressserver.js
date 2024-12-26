// server.js (Main Server Setup)

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';


import mongooseDb from './db.utils/mongoose-connection.js';
import RegisterRouter from './router/auth/register.js';
import LoginRouter from './router/auth/login.js';
import ForgetPassword from './router/controller/forgetpassword.js';
import ResendRouter from "./router/auth/resend.js";
import ResetPassword from './router/controller/resetpassword.js';
import UserRouter from './router/user.js';
import ActivateRouter from './router/auth/activater.js';
import categoryRouter from './router/uploads/category.js';
import ProductRouter from './router/uploads/product.js';


// Load environment variables from .env file
dotenv.config();

const server = express();

// Connect to MongoDB using mongoose
await mongooseDb();

// Middleware
server.use(express.json());
server.use(cors());


// Middleware
server.use(express.json());
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200 // For older browsers
};

server.use(cors(corsOptions));

// Authentication Middleware
const authenticateJWT = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Custom middleware to log requests
const customMiddleware = (req, res, next) => {
  console.log(
    new Date().toISOString(),
    "Handling Request",
    req.method,
    req.originalUrl
  );
  next();
};
server.use(customMiddleware);

// Protected Route Example (Only Super Admin)
server.get('/admin-data', authenticateJWT(['superadmin']), (req, res) => {
  res.json({ message: 'Super admin access granted!' });
});

// Protected Route Example (User or Super Admin)
server.get('/user-data', authenticateJWT(['superadmin', 'user']), (req, res) => {
  res.json({ message: `User data for ${req.user.role}` });
});




// Static folder for uploads
server.use('/uploads', express.static(path.resolve('uploads')));



// Routes
server.use("/register", RegisterRouter);
server.use("/login", LoginRouter);
server.use("/activate", ActivateRouter);
server.use("/reactivate", ResendRouter);
server.use("/forget-password", ForgetPassword);
server.use('/reset-password', ResetPassword);
server.use('/check-user', UserRouter);
server.use('/category', categoryRouter);
server.use('/products', ProductRouter);

// Start server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log('Server is running on port', port);
});
