import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { string } from "yup";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: false,
    }, 
    activationToken: {
      type: String,
      required: false,
    },
    activationTokenExpires: {
      type: Date,
      required: false,
    },
    role: {
      type: String,
      enum: ["superadmin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);




const Usermodel = mongoose.model("User", userSchema, "Users");


const ImageSchema = new mongoose.Schema({
  original: { type: String, required: true },
  thumbnail: { type: String, required: true },
});
// Define the Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true }, // Store as a number
  img: { type: [ImageSchema], required: true },
  distance: { type: Number, required: true },
  description: { type: [String], required: false },
  variant: { type: [String], required: true },
  status: { type: String, required: false },
  specs: { type: [String], required: false },
  registration_year: { type: Number, required: true },
  month: { type: String, required: true },
  vehicle_model: { type: String, required: true },
  vehicle_make: { type: String, required: true },
  kilometer_driven: { type: String, required: true },
  fuel_type: { type: String, required: true },
  transmission: { type: String, required: true },
  no_of_owners: { type: Number, required: false },
  color: { type: String, required: false },
  insurance: { type: String, required: false },
  loan: { type: String, required: false },
  exchange: { type: String, required: false },
  power_stearing: { type: String, required: false },
  power_window: { type: String, required: false },
  allow_wheel: { type: String, required: false },
  flood_affected: { type: String, required: false },

});


const Product = mongoose.model("Product", ProductSchema,"Products");






// Vehicle Category Schema
const vehicleCategorySchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    vehicleCategory: { type: String, required: true, unique: true, trim: true,sparse:true },
    img: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { timestamps: true }

);
vehicleCategorySchema.pre('save', function(next) {
  if (!this.vehicleCategory || this.vehicleCategory.trim() === '') {
    this.vehicleCategory = 'default-category';
  }
  next();
});
const VehicleCategory = mongoose.model("VehicleCategory", vehicleCategorySchema, "VehicleCategories");

// Brand Schema
const brandSchema = new mongoose.Schema(
  {
    vehicle_make: { type: String, required: true, unique: true },
    img: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleCategory", required: true },
    createdOn: { type: Date, default: Date.now },
    vehicle_model: [{ type: mongoose.Schema.Types.ObjectId, ref: "VehicleModel" }],
  },
  { timestamps: true }
);
const VehicleBrand = mongoose.model("VehicleBrand", brandSchema, "VehicleBrands");

// Vehicle Model Schema
const vehicleModelSchema = new mongoose.Schema(
  {
    vehicle_make: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleBrand", required: true },
    vehicle_model: { type: String, required: true },
    img: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleCategory"   },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);
const VehicleModel = mongoose.model("VehicleModel", vehicleModelSchema, "VehicleModels");


export { Usermodel, Product,VehicleModel,VehicleBrand ,VehicleCategory};
