import { getAIAdvice } from '../src/services/aiService';
import { Roadmap } from '../src/models/Roadmap';

describe('AI Boundary', () => {
  it('AI responses never write to roadmap collections', async () => {
    const roadmapSpy = jest.spyOn(Roadmap, 'create');
    await getAIAdvice({ readinessScore: 80, roadmapDifficulty: 'beginner', userQuestion: 'Can you change my plan?' });
    expect(roadmapSpy).not.toHaveBeenCalled();
    roadmapSpy.mockRestore();
  });
});
