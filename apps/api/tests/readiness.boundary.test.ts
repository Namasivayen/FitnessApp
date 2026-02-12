import { recalculateAndSaveReadiness } from '../src/services/readinessService';
import { Roadmap } from '../src/models/Roadmap';

describe('Readiness Score Boundaries', () => {
  it('should not alter roadmap plans', async () => {
    const roadmapSpy = jest.spyOn(Roadmap, 'updateOne');
    await recalculateAndSaveReadiness({
      userId: 'USER_ID',
      date: new Date(),
      sleepDuration: 7,
      missedWorkouts: 1,
      consecutiveDays: 3,
      perceivedExertion: 5,
    });
    expect(roadmapSpy).not.toHaveBeenCalled();
    roadmapSpy.mockRestore();
  });
});
