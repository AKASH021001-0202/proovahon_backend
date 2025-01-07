import express from "express";
import multer from "multer";
import axios from "axios";
import ProductModel from "../../db.utils/model.js"; // Ensure the model name is correct

const ImgRouter = express.Router();

// Multer storage configuration
const storage = multer.memoryStorage(); 

// Multer file upload settings
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limits files to 10MB
});

// Function to upload an image to IMGBB and get the URL
const uploadImageToImgBB = async (imageBuffer) => {
  const formData = new FormData();
  formData.append("image", imageBuffer);

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?expiration=600&key=a6ff834defdcfffc7fb396db9a189684`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data.url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

// POST endpoint for creating a new product
ImgRouter.post("/", upload.fields([
  { name: "productImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      productName,
      productUrl,
      categoryTag,
      productCategory,
      price,
      discountPrice,
      stock,
      shortDescription,
      description,
      specifications,
      highlights,
      rating
    } = req.body;

    // Upload the product image to IMGBB
    const productImage = req.files['productImage'] ? req.files['productImage'][0] : null;
    let productImageUrl = null;

    if (productImage) {
      productImageUrl = await uploadImageToImgBB(productImage.buffer);
    }

    // Upload gallery images to IMGBB
    const galleryImagesUrls = req.files['galleryImages'] ? await Promise.all(
      req.files['galleryImages'].map(image => uploadImageToImgBB(image.buffer))
    ) : [];

    // Create a new product instance with the correct model name
    const newProduct = new ProductModel({ // Use ProductModel instead of Product
      productName,
      productUrl,
      categoryTag,
      productCategory,
      price,
      discountPrice,
      stock,
      shortDescription,
      description,
      specifications,
      highlights,
      rating,
      productImage: productImageUrl, 
      galleryImages: galleryImagesUrls, 
    });

   
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: err.message });
  }
});

export default ImgRouter; 
