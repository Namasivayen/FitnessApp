import mongoose, { Document, Schema } from 'mongoose';

export interface IUserRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: string;
  startDate: Date;
  status: 'active' | 'archived';
}

const UserRoadmapSchema = new Schema<IUserRoadmap>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: String, ref: 'Roadmap', required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'archived'], required: true },
});

export const UserRoadmap = mongoose.model<IUserRoadmap>('UserRoadmap', UserRoadmapSchema);
