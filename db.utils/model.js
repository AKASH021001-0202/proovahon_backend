import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
  model: { type: String, required: true },
  brand: { type: String, required: true },
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

const Product = mongoose.model("Product", ProductSchema, "Products");

// Vehicle Category Schema
const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      sparse: true,
    },
    img: { type: String, required: true },
    slug: { type: String, required: true },
    brand:  {
      type: [String],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

const Category = mongoose.model(
  "Category",
  CategorySchema,
  "Categories"
);

// Brand Schema
const brandSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, unique: true },
    img: { type: String, required: true },
    category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    createdOn: { type: Date, default: Date.now },
    model: {
      type: Array,
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);
const Brand = mongoose.model(
  "Brand",
  brandSchema,
  "Brands"
);

// Vehicle Model Schema
const ModelSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    img: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);
const VehicleModel = mongoose.model(
  "Model",
  ModelSchema,
  "Models"
);

export { Usermodel, Product, VehicleModel, Brand, Category };
