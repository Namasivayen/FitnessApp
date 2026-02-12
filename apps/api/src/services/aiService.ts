// Gemini AI integration stub with strict boundaries

interface AIChatInput {
  readinessScore: number;
  roadmapDifficulty: string;
  userQuestion: string;
}

export async function getAIAdvice({ readinessScore, roadmapDifficulty, userQuestion }: AIChatInput): Promise<string> {
  // Simulate Gemini AI response logic with strict boundaries
  let response = '';

  // Explain readiness score
  if (/readiness|score|fatigue|tired|energy/i.test(userQuestion)) {
    if (readinessScore < 40) {
      response += 'Your readiness score is low. Consider prioritizing rest and recovery.';
    } else if (readinessScore < 70) {
      response += 'Your readiness score is moderate. You may benefit from reduced intensity or active recovery.';
    } else {
      response += 'Your readiness score is high. You are well-prepared for training.';
    }
  }

  // Suggest recovery or reduced intensity
  if (/recovery|rest|overtrain|sore|reduce|intensity/i.test(userQuestion)) {
    response += ' It is important to listen to your body. If you feel fatigued, consider a lighter session or rest.';
  }

  // Educate on training principles
  if (/principle|progress|adapt|overload|periodization|training/i.test(userQuestion)) {
    response += ' Progressive overload and adequate recovery are key to long-term fitness gains.';
  }

  // Suggest diet or supplements contextually
  if (/diet|nutrition|supplement|protein|carb|fat|vitamin/i.test(userQuestion)) {
    response += ' Ensure your diet supports your training. Consider balanced meals and consult a professional for supplements.';
  }

  // Default fallback
  if (!response) {
    response = 'I can provide advice on readiness, recovery, training principles, and nutrition. Please ask a related question.';
  }

  // Always append disclaimer
  response += ' This is advisory guidance only.';
  return response;
}
