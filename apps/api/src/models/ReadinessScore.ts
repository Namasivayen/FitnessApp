import mongoose, { Document, Schema } from 'mongoose';

export interface IReadinessScore extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  score: number;
  category: string;
}

const ReadinessScoreSchema = new Schema<IReadinessScore>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  score: { type: Number, required: true },
  category: { type: String, required: true },
});

export const ReadinessScore = mongoose.model<IReadinessScore>('ReadinessScore', ReadinessScoreSchema);
