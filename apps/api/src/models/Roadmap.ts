import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmap extends Document {
  roadmapId: string;
  domain: string;
  difficulty: string;
  fixedDurationWeeks: number;
  phases: any[];
  version: string;
  createdByAdmin: boolean;
  isActive: boolean;
}

const RoadmapSchema = new Schema<IRoadmap>({
  roadmapId: { type: String, required: true, unique: true },
  domain: { type: String, required: true },
  difficulty: { type: String, required: true },
  fixedDurationWeeks: { type: Number, required: true },
  phases: { type: [Schema.Types.Mixed as any], required: true },
  version: { type: String, required: true },
  createdByAdmin: { type: Boolean, required: true },
  isActive: { type: Boolean, required: true },
}, { timestamps: true });


// Enforce immutability for all fields except isActive (for admin activation/deactivation)
RoadmapSchema.pre('save', function (next) {
  if (!this.isNew) {
    // Only allow isActive to be changed
    const modified = this.modifiedPaths().filter((p) => p !== 'isActive' && p !== 'updatedAt');
    if (modified.length > 0) {
      const err = new Error('Roadmap is immutable except for isActive');
      // @ts-ignore
      return next(err);
    }
  }
  next();
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
