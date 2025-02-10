import express from "express";
import { Category, Brand } from "../../db.utils/model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import slugify from "slugify";

const VehicleBrandRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve("uploads/brand");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filePath = path.resolve("uploads/brand", file.originalname);

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return cb(new Error("File already exists"));
    }

    cb(null, Date.now() + "-" + file.originalname); // Use timestamp to prevent conflicts
  },
});

const upload = multer({ storage: storage });

// 🚀 CREATE Brand
VehicleBrandRouter.post("/", upload.single("img"), async (req, res) => {
  try {
    let { brand, category } = req.body;
    console.log(req.body);
    const img = req.file ? `/uploads/brand/${req.file.filename}` : "";

    // 🛑 Check if brand already exists
    const existingBrand = await Brand.findOne({ brand });
    if (existingBrand) {
      return res.status(400).json({ error: "Brand already exists" });
    }

    // 🛑 Find category by ID
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ error: "Invalid category selected." });
    }

    // ✅ Create new brand and store category ID reference
    const newBrand = new Brand({
      brand,
      img,
      category: categoryDoc._id, // Store category's ObjectId reference in the Brand
    });

    await newBrand.save();

    // ✅ Push the new brand's name into the category's brand array
    categoryDoc.brand.push(newBrand.brand); // Push the brand name
    await categoryDoc.save();

    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(400).json({ error: error.message });
  }
});

// 📚 GET All Brands with only brand and category.category fields
VehicleBrandRouter.get("/", async (req, res) => {
  try {
    // Projecting only brand and category.category fields
    const brands = await Brand.find()
      .populate('category', 'category') 
      .select('brand category img'); 
    
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔍 GET Single Brand by ID
VehicleBrandRouter.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate("category");
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.status(200).json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🚀 UPDATE Brand (including image update)
VehicleBrandRouter.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    if (req.file) {
      // Delete old image if it exists
      if (brand.img && fs.existsSync(brand.img)) {
        fs.unlinkSync(brand.img);
      }
      req.body.img = req.file.path;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🚀 DELETE Brand
VehicleBrandRouter.delete("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // 🛑 Find the category and remove the brand's NAME from the brands array
    const category = await Category.findById(brand.category);
    if (category) {
      category.brand = category.brand.filter(
        (brandName) => brandName !== brand.brand
      );
      await category.save();
    }

    // ✅ Delete the brand after removing its reference from category
    await Brand.findByIdAndDelete(req.params.id);

    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default VehicleBrandRouter;
