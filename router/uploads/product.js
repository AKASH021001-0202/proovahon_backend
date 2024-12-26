import express  from "express";
import { Productmodel } from "../../db.utils/model.js";


const ProductRouter = express.Router();

// GET all products
ProductRouter.post('/', async (req, res) => {
    try {
      const { 
        productName, productUrl, categoryTag, productImage, 
        productCategory, price, discountPrice, stock, 
        shortDescription, description, specifications, 
        highlights, rating, galleryImages 
      } = req.body;
  
      const newProduct = new Product({
        productName,
        productUrl,
        categoryTag,
        productImage,
        productCategory,
        price,
        discountPrice,
        stock,
        shortDescription,
        description,
        specifications,
        highlights,
        rating,
        galleryImages,
      });
  
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });
  
  // @route   GET /api/products
  // @desc    Get all products
  ProductRouter.get('/', async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });
  
  // @route   GET /api/products/:id
  // @desc    Get a single product by ID
  ProductRouter.get('/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });
  
  // @route   PUT /api/products/:id
  // @desc    Update a product by ID
  ProductRouter.put('/:id', async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, 
        { $set: req.body }, 
        { new: true, runValidators: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });
  
  // @route   DELETE /api/products/:id
  // @desc    Delete a product by ID
  ProductRouter.delete('/:id', async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });
  

export default ProductRouter;
