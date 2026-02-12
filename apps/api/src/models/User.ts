import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  mobile?: string;
  passwordHash: string;
  role: 'user' | 'admin';
  profileCompleted: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: false, unique: true, sparse: true },
  mobile: { type: String, required: false, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
