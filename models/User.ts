import { Schema, model, models, type Model } from "mongoose";

export type MacroTarget = { protein: number; fat: number; carbs: number };

export interface IUser {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    fullName?: string;
    diets: string[];
    allergens: string[];
    disliked: string[];
    cuisines: string[];
    weeklyBudget?: number;
    calorieTarget?: number;
    macroTarget?: MacroTarget;
    cookingFreq?: string;
    shoppingFreq?: string;
    storePrefs: string[];
    profileCompleted: boolean;
    favorites: string[]; // product ids
  };
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, index: true, required: true },
  passwordHash: { type: String, required: true },
  profile: {
    fullName: String,
    diets: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    disliked: { type: [String], default: [] },
    cuisines: { type: [String], default: [] },
    weeklyBudget: Number,
    calorieTarget: Number,
    macroTarget: {
      protein: { type: Number, default: 25 },
      fat: { type: Number, default: 30 },
      carbs: { type: Number, default: 45 }
    },
    cookingFreq: String,
    shoppingFreq: String,
    storePrefs: { type: [String], default: [] },
    profileCompleted: { type: Boolean, default: false },
    favorites: { type: [Schema.Types.ObjectId], ref: "Product", default: [] }
  }
}, { timestamps: true });

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);