import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: string;
  activityLevel: string;
  dietPreference: string;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  fitnessGoal: { type: String, required: true },
  activityLevel: { type: String, required: true },
  dietPreference: { type: String, required: true },
});

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
