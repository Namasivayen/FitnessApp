import { ReadinessScore } from '../models/ReadinessScore';
import mongoose from 'mongoose';

export interface ReadinessInput {
  userId: mongoose.Types.ObjectId;
  date: Date;
  sleepDuration: number; // hours
  missedWorkouts: number;
  consecutiveDays: number;
  perceivedExertion: number; // 1-10
}

export function calculateReadinessScore(input: ReadinessInput) {
  // Example scoring logic (tune as needed)
  let score = 100;
  score -= Math.max(0, 8 - input.sleepDuration) * 5; // Penalty for less than 8h sleep
  score -= input.missedWorkouts * 10;
  score -= Math.max(0, input.consecutiveDays - 5) * 5; // Penalty for >5 days in a row
  score -= (input.perceivedExertion - 5) * 3; // Higher exertion, lower score
  score = Math.max(0, Math.min(100, score));
  let category: 'Low' | 'Moderate' | 'High' = 'High';
  if (score < 40) category = 'Low';
  else if (score < 70) category = 'Moderate';
  return { score, category };
}

export async function recalculateAndSaveReadiness(input: ReadinessInput) {
  const { score, category } = calculateReadinessScore(input);
  await ReadinessScore.findOneAndUpdate(
    { userId: input.userId, date: input.date },
    { score, category },
    { upsert: true, new: true }
  );
  return { score, category };
}
