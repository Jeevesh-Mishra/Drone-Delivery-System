import { Schema, model } from 'mongoose';

export interface IWarehouse {
  warehouseId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

const warehouseSchema = new Schema<IWarehouse>({
  warehouseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
});

export const Warehouse = model<IWarehouse>('Warehouse', warehouseSchema);
