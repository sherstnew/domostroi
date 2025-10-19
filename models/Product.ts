import { Schema, model, models, type Model } from "mongoose";

export interface IProduct {
  name: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  categories: string[];
  unit: string;         // "g", "ml", "pcs"
  packageSize: number;  // numeric value
  priceAvg: number;     // average price
  dietaryTags: string[]; // ["vegan","glutenFree",...]
  nutrition: {
    calories: number; protein: number; fat: number; carbs: number; fiber?: number; sugar?: number; sodium?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, index: "text" },
  brand: String,
  description: String,
  imageUrl: String,
  categories: { type: [String], default: [] },
  unit: { type: String, default: "g" },
  packageSize: { type: Number, default: 100 },
  priceAvg: { type: Number, default: 100 },
  dietaryTags: { type: [String], default: [] },
  nutrition: {
    calories: Number, protein: Number, fat: Number, carbs: Number, fiber: Number, sugar: Number, sodium: Number
  }
}, { timestamps: true });

ProductSchema.index({ name: "text", brand: "text", categories: "text" });
ProductSchema.index({ "nutrition.calories": 1, "nutrition.protein": 1, "nutrition.fat": 1, "nutrition.carbs": 1 });
ProductSchema.index({ priceAvg: 1 });

export const Product: Model<IProduct> = models.Product || model<IProduct>("Product", ProductSchema);