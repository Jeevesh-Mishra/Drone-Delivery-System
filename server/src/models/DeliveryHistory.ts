import { Schema, model } from 'mongoose';

export interface IDeliveryHistory {
  deliveryId: string;
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  updatedBy: string;
  timestamp: Date;
  remarks: string;
}

const deliveryHistorySchema = new Schema<IDeliveryHistory>({
  deliveryId: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Assigned', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'] },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  remarks: { type: String, required: true },
});

export const DeliveryHistory = model<IDeliveryHistory>('DeliveryHistory', deliveryHistorySchema);
