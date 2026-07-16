import { Schema, model } from 'mongoose';

export interface IPackage {
  packageId: string;
  deliveryId: string;
  weight: number; // in kg
  type: string; // Electronics, Medical Supplies, etc.
  fragile: boolean;
}

const packageSchema = new Schema<IPackage>({
  packageId: { type: String, required: true, unique: true },
  deliveryId: { type: String, required: true },
  weight: { type: Number, required: true },
  type: { type: String, required: true },
  fragile: { type: Boolean, required: true, default: false },
});

export const Package = model<IPackage>('Package', packageSchema);
