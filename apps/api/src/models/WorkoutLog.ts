import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutLog extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: string;
  dayIndex: number;
  completed: boolean;
  skippedExercises: string[];
  perceivedExertion: number;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: String, ref: 'Roadmap', required: true },
  dayIndex: { type: Number, required: true },
  completed: { type: Boolean, required: true },
  skippedExercises: { type: [String], default: [] },
  perceivedExertion: { type: Number, required: true },
});

export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
