import express from 'express';
import { Brand, Model } from '../../db.utils/model.js';
const Modelrouter = express.Router();

// Create a new model
Modelrouter.post('/', async (req, res) => {
  const { brandId, modelName, year } = req.body;

  try {
    // Find the brand by ID
    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    // Create new model
    const newModel = new Model({ brand: brandId, modelName, year });
    await newModel.save();

    // Add the new model to the brand's models array
    brand.models.push(newModel._id);
    await brand.save();

    res.status(201).json(newModel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all models for a specific brand
Modelrouter.get('/brand/:brandId', async (req, res) => {
  try {
    const models = await Model.find({ brand: req.params.brandId });
    res.status(200).json(models);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific model by ID
Modelrouter.get('/models/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id).populate('brand');
    if (!model) return res.status(404).json({ message: 'Model not found' });
    res.status(200).json(model);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a model
Modelrouter.put('/:id', async (req, res) => {
  const { modelName, year } = req.body;

  try {
    const updatedModel = await Model.findByIdAndUpdate(
      req.params.id,
      { modelName, year },
      { new: true }
    );
    if (!updatedModel) return res.status(404).json({ message: 'Model not found' });
    res.status(200).json(updatedModel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a model
Modelrouter.delete('/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });

    // Remove model from brand's models array
    const brand = await Brand.findById(model.brand);
    brand.models = brand.models.filter((m) => m.toString() !== req.params.id);
    await brand.save();

    // Delete the model
    await model.remove();

    res.status(200).json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default Modelrouter;
