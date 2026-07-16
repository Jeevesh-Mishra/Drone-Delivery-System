import { Schema, model } from 'mongoose';

export interface INoFlyZone {
  zoneName: string;
  polygonCoordinates: [number, number][]; // [[lng, lat], [lng, lat], ...] forming a polygon
  restrictionLevel: 'Restricted' | 'Warning';
  status: 'Active' | 'Inactive';
}

const noFlyZoneSchema = new Schema<INoFlyZone>({
  zoneName: { type: String, required: true, unique: true },
  polygonCoordinates: { type: [[Number]], required: true },
  restrictionLevel: { type: String, required: true, enum: ['Restricted', 'Warning'], default: 'Restricted' },
  status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
});

export const NoFlyZone = model<INoFlyZone>('NoFlyZone', noFlyZoneSchema);
