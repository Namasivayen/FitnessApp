import express from 'express';
import { body, validationResult } from 'express-validator';
import { jwtAuth } from '../middleware/jwtAuth';
import { recalculateAndSaveReadiness } from '../services/readinessService';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/readiness/calculate
import { Request } from 'express';

router.post('/calculate',
  jwtAuth,
  body('sleepDuration').isFloat({ min: 0, max: 24 }),
  body('missedWorkouts').isInt({ min: 0 }),
  body('consecutiveDays').isInt({ min: 0 }),
  body('perceivedExertion').isInt({ min: 1, max: 10 }),
  async (req: Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    // @ts-ignore
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { sleepDuration, missedWorkouts, consecutiveDays, perceivedExertion } = req.body;
    const date = new Date();
    const result = await recalculateAndSaveReadiness({
      userId,
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      sleepDuration,
      missedWorkouts,
      consecutiveDays,
      perceivedExertion,
    });
    res.json(result);
  }
);

export default router;
