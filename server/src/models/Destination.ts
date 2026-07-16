import { Schema, model } from 'mongoose';

export interface IDestination {
  destinationId: string;
  name: string;
  latitude: number;
  longitude: number;
  priority: 'High' | 'Medium' | 'Low';
  address: string;
}

const destinationSchema = new Schema<IDestination>({
  destinationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  address: { type: String, required: true },
});

export const Destination = model<IDestination>('Destination', destinationSchema);
