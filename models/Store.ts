import { Schema, model, models, type Model } from "mongoose";

export interface IStore {
  name: string;
  address: {
    line1: string;
    city: string;
    lat: number;
    lng: number;
  };
  sections: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  address: {
    line1: String,
    city: String,
    lat: Number,
    lng: Number
  },
  sections: { type: [String], default: [] }
}, { timestamps: true });

export const Store: Model<IStore> = models.Store || model<IStore>("Store", StoreSchema);