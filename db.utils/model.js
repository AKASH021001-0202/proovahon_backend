import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { string } from "yup";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true, // Added required validation
    },
    email: {
      type: String,
      unique: true,
      required: true, // Added required validation
    },
    phone: {
      type: String,
      required: false, // Optional phone field
    },
    password: {
      type: String,
      required: true, // Added required validation
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      required: false,
    },
    activationTokenExpires: {
      // Added field for token expiration
      type: Date,
      required: false,
    },
    NewactivationToken: { type: String ,
      required: false,
    },
    NewactivationTokenExpires: { type: Date,
      required: false,
     },

    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    role: { type: String, enum: ["superadmin", "user"], default: "user" },
  },
  { timestamps: true }
);

const Usermodel = mongoose.model("User", userSchema, "Users");

// Category Schema
const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: false,
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    default: null, 
  },
});

const Categorymodel = mongoose.model("Category", categorySchema, "Categories"); // fixed pluralization
const ProductSchema = new Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: false,
  },
  reviews: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    rating: { type: Number, min: 1, max: 5 }, // Rating out of 5
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  }],
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Prevent negative stock
  },
  shortDescription: {
    type: String,
    required: false,
  },
  productImage: {
    type: String, // URL or path to the product image
    required: true,
  },
  galleryImages: [{
    type: String, // Array of URLs or paths to gallery images
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category', // Assuming you have a Category model
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0, // Default rating value
  },
  specifications: {
    type: Map,
    of: String, // Key-value pairs for specifications
  },
  highlights: {
    type: [String], // Array of highlights for the product
  },
  additionalOffers: [{
    type: String, // Array to hold any additional offers
  }],
}, { timestamps: true }); // Automatically create createdAt and updatedAt timestamps

const Productmodel = mongoose.model("Product", ProductSchema,"Products");
export {
  Usermodel,
  Categorymodel,Productmodel
};
