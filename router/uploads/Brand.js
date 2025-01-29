import express from 'express'; // Assuming the models are in models.js
import { Brand } from '../../db.utils/model.js';
const Brandrouter = express.Router();

// Create a new brand
Brandrouter.post('/', async (req, res) => {
  const { name, img } = req.body;

  try {
    const newBrand = new Brand({ name, img });
    await newBrand.save();
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all brands
Brandrouter.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().populate('models');
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific brand by ID
Brandrouter.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate('models');
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(brand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a brand
Brandrouter.put('/:id', async (req, res) => {
  const { name, img } = req.body;

  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, img },
      { new: true }
    );
    if (!updatedBrand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a brand
Brandrouter.delete('/:id', async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (!deletedBrand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default Brandrouter;
