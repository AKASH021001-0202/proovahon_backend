import express from "express";
import { VehicleBrand, VehicleCategory } from "../../db.utils/model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import slugify from "slugify";

const VehicleBrandRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve('uploads/brand');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = path.resolve('uploads/brand', file.originalname);
    
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error('File already exists'));
    }

    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to prevent conflicts
  },
});


const upload = multer({ storage: storage });

// 🚀 CREATE Category (with image upload)
VehicleBrandRouter.post("/", upload.single("img"), async (req, res) => {
  try {
    let { vehicle_make, category } = req.body;
    const img = req.file ? `/uploads/brand/${req.file.filename}` : '';

    // 🛑 Find category by name and get its ObjectId
    const categoryDoc = await VehicleCategory.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ error: "Invalid category selected." });
    }

    // Create new brand with correct ObjectId reference
    const newBrand = new VehicleBrand({
      vehicle_make,
      img,
      category: categoryDoc._id, // Store ObjectId instead of string
    });

    await newBrand.save();
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(400).json({ error: error.message });
  }
});

VehicleBrandRouter.get("/", async (req, res) => {
  try {
    const brands = await VehicleBrand.find().populate("category vehicle_model");
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🚀 UPDATE Brand (including image update)
VehicleBrandRouter.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const brand = await VehicleBrand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (req.file) {
      // Delete old image if it exists
      if (brand.img && fs.existsSync(brand.img)) {
        fs.unlinkSync(brand.img);
      }
      req.body.img = req.file.path;
    }

    const updatedBrand = await VehicleBrand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🚀 DELETE Brand
VehicleBrandRouter.delete("/:id", async (req, res) => {
  try {
    const brand = await VehicleBrand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    // Optionally, delete the image file here as well
    if (brand.img && fs.existsSync(brand.img)) {
      fs.unlinkSync(brand.img);
    }
    res.status(200).json({ message: "Brand deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default VehicleBrandRouter;
