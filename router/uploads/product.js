import express from "express";
import { Product } from "../../db.utils/model.js";

const ProductRouter = express.Router();

ProductRouter.post("/", async (req, res) => {
  try {
    let productData = req.body;

    // Convert price string (e.g., ₹6,55,025) to a number
 
    // Validation and saving logic here
    const requiredFields = [
      "name",
      "type",
      "location",
      "price",
      "img",
      "registration_year",
      "vehicle_model",
      "vehicle_make",
      "kilometer_driven",
      "fuel_type",
      "transmission",
    ];

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: "Product added successfully!",
    
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

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default ProductRouter;
