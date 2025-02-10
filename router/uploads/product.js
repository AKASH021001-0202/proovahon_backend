import express from "express";
import { Product } from "../../db.utils/model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import slugify from 'slugify';

const ProductRouter = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve('uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to prevent conflicts
  },
});

const upload = multer({ storage: storage });

// POST route to add a new product
ProductRouter.post("/", upload.single('img'), async (req, res) => {
  try {
    let productData = req.body;

    // Add the image path to the product data
    if (req.file) {
      productData.img = `/uploads/products/${req.file.filename}`;
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "type",
      "location",
      "price",
      "img",
      "registration_year",
      "model",
      "brand",
      "kilometer_driven",
      "fuel_type",
      "transmission",
    ];

    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Product added successfully!",
      data: savedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products
ProductRouter.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// GET product by ID
ProductRouter.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the ID is a valid MongoDB ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID." });
    }

    // Find product by ID
    const product = await Product.findById(productId);

    // If product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the product
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// DELETE a product by ID
ProductRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID." });
    }

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Delete the associated image file (if it exists)
    if (deletedProduct.img) {
      const imagePath = path.resolve(deletedProduct.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default ProductRouter;