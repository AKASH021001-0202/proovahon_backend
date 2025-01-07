// server.js (Main Server Setup)

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';


import mongooseDb from './db.utils/mongoose-connection.js';
import RegisterRouter from './router/auth/register.js';
import LoginRouter from './router/auth/login.js';
import ProductRouter from './router/uploads/product.js';

// Load environment variables from .env file
dotenv.config();

const server = express();

// Connect to MongoDB using mongoose
await mongooseDb();

// Middleware
server.use(express.json());
server.use(cors());

// Custom middleware to log requests
const customMiddleware = (req, res, next) => {
  console.log(
    new Date().toISOString(),
    'Handling Request',
    req.method,
    req.originalUrl
  );
  next();
};




// Static folder for uploads
server.use('/uploads', express.static(path.resolve('uploads')));

// Apply middleware globally
server.use(customMiddleware);

// Routes
server.use('/register', RegisterRouter);
server.use('/login', LoginRouter);
server.use('/product', ProductRouter);



// Start server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log('Server is running on port', port);
});
