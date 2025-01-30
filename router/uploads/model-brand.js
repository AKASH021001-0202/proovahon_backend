import express from 'express';
import { VehicleModel } from '../../db.utils/model.js';


const VehicleModelRouter = express.Router();
VehicleModelRouter.get("/", async (req, res) => {
  const models = await VehicleModel.find().populate("vehicle_make");
  res.json(models);
});

VehicleModelRouter.post("/", async (req, res) => {
  const model = await VehicleModel.create(req.body);
  res.json(model);
});


export default VehicleModelRouter;
