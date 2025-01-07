import express from 'express';
import { Usermodel } from '../../db.utils/model.js';


const UserRouter = express.Router();


UserRouter.get('/all', async (req, res) => {
    try {
      const users = await Usermodel.find();
      res.send(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send({ message: 'Failed to fetch users', error: err.message });
    }
  });

  UserRouter.post("/", async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await Usermodel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
      
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  UserRouter.get("/user", async (req, res) => {
    const { email } = req.query; // Using query for GET request
   
  
    try {
      const user = await Usermodel.findOne({ email });
  
  
      if (!user) {
        return res.status(200).json({ exists: false }); // User does not exist
      }
  
      res.status(200).json({ exists: true }); // User exists
    } catch (err) {
    
      res.status(500).json({ message: err.message });
    }
  });
  
  
export default UserRouter;
