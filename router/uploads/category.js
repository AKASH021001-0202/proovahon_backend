import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import slugify from 'slugify';
import { Category } from '../../db.utils/model.js';

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
    const uploadDir = path.resolve('uploads/categories');
    const filePath = path.join(uploadDir, file.originalname);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error('File with the same name already exists. Please rename the file and try again.'));
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


// 🚀 CREATE Category (with image upload)
categoryRouter.post('/', upload.single('img'), async (req, res) => {
  try {
    const { category } = req.body;
    if (!category ) {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }

    const slug = slugify(category, { lower: true });
    let img = '';

    if (req.file) {
      img = `/uploads/categories/${req.file.filename}`;
    }


    const newCategory = new Category({ category, img, slug });
    await newCategory.save();

    res.status(201).json({ message: 'Category created successfully', data: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 READ ALL Categories
categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔍 READ Single Category by Slug
categoryRouter.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔄 UPDATE Category (with optional image upload)
categoryRouter.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { category: categoryName } = req.body;

    if (!categoryName || typeof categoryName !== 'string') {
      return res.status(400).json({ message: 'Invalid category name' });
    }

    const slug = slugify(categoryName, { lower: true });

    // Prepare the update data with Category and slug
    let updatedData = { category: categoryName, slug };

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Retain existing image if no new one is uploaded
    updatedData.img = req.file ? `/uploads/categories/${req.file.filename}` : existingCategory.img;

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🗑️ DELETE Category and Remove Image
categoryRouter.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if an image exists and delete it
    if (category.img) {
      const imagePath = path.join(process.cwd(), category.img);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        });
      }
    }

    // Delete category from MongoDB
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default categoryRouter;
