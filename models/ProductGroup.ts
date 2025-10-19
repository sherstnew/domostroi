import { Schema, model, models, type Model } from "mongoose";

export interface IProductGroup {
  userId: Schema.Types.ObjectId;
  name: string;
  productIds: Schema.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IProductGroup>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  name: { type: String, required: true },
  productIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  notes: String
}, { timestamps: true });

export const ProductGroup: Model<IProductGroup> = models.ProductGroup || model<IProductGroup>("ProductGroup", GroupSchema);