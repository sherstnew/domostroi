import { Schema, model, models, type Model } from "mongoose";

export interface IAvailability {
  productId: Schema.Types.ObjectId;
  storeId: Schema.Types.ObjectId;
  section: string;
  aisle: string;   // ряд
  shelf: string;   // полка
  inStock: boolean;
  price: number;
  lastUpdated: Date;
}

const AvailabilitySchema = new Schema<IAvailability>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
  storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
  section: String,
  aisle: String,
  shelf: String,
  inStock: Boolean,
  price: Number,
  lastUpdated: { type: Date, default: () => new Date() }
}, { timestamps: true });

AvailabilitySchema.index({ productId: 1, storeId: 1 }, { unique: true });

export const ProductAvailability: Model<IAvailability> = models.ProductAvailability || model<IAvailability>("ProductAvailability", AvailabilitySchema);