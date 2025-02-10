import express from "express";
import {

  Brand,
  Category,
  VehicleModel,
} from "../../db.utils/model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve("uploads/models");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = path.resolve("uploads/models", file.originalname);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error("File already exists"));
    }

    cb(null, Date.now() + "-" + file.originalname); // Use timestamp to prevent conflicts
  },
});

const upload = multer({
  storage: storage,
});

const VehicleModelRouter = express.Router();

// Get all vehicle models
VehicleModelRouter.get("/", async (req, res) => {
  try {
    const models = await VehicleModel.find();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


VehicleModelRouter.post("/", upload.single("img"), async (req, res) => {
  try {
    const { brand, model, year } = req.body;

    console.log("Received brand:", brand);

    // 🔍 Find the brand by name and get its category
    const Brand = await Brand.findOne({ brand }).populate("category");

    if (!Brand) {
      return res.status(400).json({ error: "Brand not found" });
    }

    // 📌 Ensure an image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // 📌 Construct the full image path
    const imagePath = `/uploads/models/${req.file.filename}`;

    // ✅ Save the brand name instead of ObjectId
    const newModel = new VehicleModel({
      brand: Brand.brand, // ✅ Save name instead of ObjectId
      model,
    
      year,
      img: imagePath,
    });

    await newModel.save();

    // 🔄 Push the new model name into the brand's model array
    await Brand.updateOne(
      { _id: Brand._id },
      { $addToSet: { model } } // Ensures unique values are added
    );

    res.status(201).json({ message: "Model added successfully", data: newModel });

  } catch (error) {
    console.error("Error during model creation:", error);
    res.status(400).json({ error: error.message });
  }
});



// Update a vehicle model
VehicleModelRouter.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, category, year } = req.body;

    const updateData = { brand, model, category, year };

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
