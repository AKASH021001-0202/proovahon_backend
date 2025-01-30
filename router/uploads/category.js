import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import slugify from 'slugify';
import { VehicleCategory } from '../../db.utils/model.js';

const categoryRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve('uploads/categories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = path.resolve('uploads/categories', file.originalname);
    
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error('File already exists'));
    }

    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to prevent conflicts
  },
});


const upload = multer({ storage: storage });

// 🚀 CREATE Category (with image upload)
// 🚀 CREATE Category (with image upload)
categoryRouter.post('/', upload.single('img'), async (req, res) => {
  try {
    const { vehicleCategory } = req.body;
    if (!vehicleCategory || !vehicleCategory.trim()) {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }

    const slug = slugify(vehicleCategory, { lower: true });
    const img = req.file ? `/uploads/categories/${req.file.filename}` : '';

    const newCategory = new VehicleCategory({ vehicleCategory, img, slug });
    await newCategory.save();

    res.status(201).json({ message: 'Category created successfully', data: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 READ ALL Categories
categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await VehicleCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔍 READ Single Category by Slug
categoryRouter.get('/:slug', async (req, res) => {
  try {
    const category = await VehicleCategory.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔄 UPDATE Category (with optional image upload)
categoryRouter.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { vehicleCategory } = req.body;
    const slug = slugify(vehicleCategory, { lower: true });

    // Prepare the update data with vehicleCategory and slug
    let updatedData = { vehicleCategory, slug };

    // Only add the image if a new image is uploaded
    if (req.file) {
      updatedData.img = `/uploads/categories/${req.file.filename}`;
    } else {
      // If no new image is provided, you can leave the image unchanged
      const existingCategory = await VehicleCategory.findById(req.params.id);
      if (existingCategory && existingCategory.img) {
        updatedData.img = existingCategory.img; // Retain the existing image if no new one is uploaded
      }
    }

    // Update the category
    const updatedCategory = await VehicleCategory.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// 🗑️ DELETE Category and Remove Image
categoryRouter.delete("/:id", async (req, res) => {
  try {
    const category = await VehicleCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if an image exists and delete it
    if (category.img) {
      const imagePath = path.resolve("uploads", category.img); // Ensure correct path
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        });
      }
    }

    // Delete category from MongoDB
    await VehicleCategory.findByIdAndDelete(req.params.id);

    res.json({ message: "Category and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default categoryRouter;
