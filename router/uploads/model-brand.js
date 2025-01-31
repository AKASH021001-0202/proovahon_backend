import express from "express";
import { VehicleBrand, VehicleCategory, VehicleModel } from "../../db.utils/model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve('uploads/models');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = path.resolve('uploads/models', file.originalname);
    
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error('File already exists'));
    }

    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to prevent conflicts
  },
});

const upload = multer({
  storage: storage,
});

const VehicleModelRouter = express.Router();

// Get all vehicle models
VehicleModelRouter.get("/", async (req, res) => {
  try {
    const models = await VehicleModel.find() 
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new vehicle model

VehicleModelRouter.post("/", upload.single("img"), async (req, res) => {
  try {
    const { vehicle_make, vehicle_model, year } = req.body;
    
    // Log the incoming data
    console.log("Received brand:", vehicle_make);

    // Find the brand to get its associated category
    const foundBrand = await VehicleBrand.findById(vehicle_make).populate("category");

    if (!foundBrand) {
      return res.status(400).json({ error: "Brand not found" });
    }

    // Automatically set the category from the brand's category
    const categoryId = foundBrand.category;

    if (!categoryId) {
      return res.status(400).json({ error: "Brand does not have an associated category" });
    }

    // Proceed with creating the model
    const newModel = new VehicleModel({
      vehicle_make,
      vehicle_model,
      category: categoryId,
      year,
      img: req.file ? `/uploads/models/${req.file.filename}` : undefined, // Handle image upload
    });

    await newModel.save();
    res.status(201).json({ message: "Model added successfully" });
  } catch (error) {
    console.error("Error during model creation:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update a vehicle model
VehicleModelRouter.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_make, vehicle_model, category, year } = req.body;

    const updateData = { vehicle_make, vehicle_model, category, year };

    if (req.file) {
      updateData.img = `/uploads/models/${req.file.filename}`;
    }

    const updatedModel = await VehicleModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedModel) {
      return res.status(404).json({ error: "Model not found" });
    }

    res.json(updatedModel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a vehicle model
VehicleModelRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedModel = await VehicleModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.status(404).json({ error: "Model not found" });
    }

    res.json({ message: "Model deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default VehicleModelRouter;
