import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Fleet Manager' | 'Logistics Operator';
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'Fleet Manager', 'Logistics Operator'], default: 'Logistics Operator' },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
