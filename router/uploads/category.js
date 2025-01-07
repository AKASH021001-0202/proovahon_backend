import express from "express";
import { Categorymodel } from "../../db.utils/model.js";

const categoryRouter = express.Router();

// Fetch all categories, including their parent categories
categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await Categorymodel.find().populate('parent'); // Populate parent category
    res.send(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send({ message: "Failed to fetch categories", error: err.message });
  }
});

// Create a new category
categoryRouter.post("/", async (req, res) => {
  const { category, slug, parent } = req.body;

  try {
    // Check if the category already exists
    const existingCategory = await Categorymodel.findOne({ category, slug });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    // Create a new category if it doesn't exist
    const newCategory = new Categorymodel({ category, slug, parent });
    const savedCategory = await newCategory.save();
    res.status(201).json({ success: true, message: "Successfully added category", data: savedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating category", error });
  }
});

// Update a category and its parent
categoryRouter.put("/", async (req, res) => {
  const { oldCategory, newCategory, oldSlug, newSlug, parent } = req.body;

  try {
    const existingCategory = await Categorymodel.findOne({ category: oldCategory, slug: oldSlug });

    if (!existingCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    existingCategory.category = newCategory;
    existingCategory.slug = newSlug;
    existingCategory.parent = parent;

    await existingCategory.save();

    res.status(200).json({ success: true, message: "Successfully updated category", data: existingCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category", error });
  }
});

// Delete a category
categoryRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existingCategory = await Categorymodel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await existingCategory.deleteOne();
    res.status(200).json({ success: true, message: "Successfully deleted category" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error });
  }
});

export default categoryRouter;
