import express from 'express';
import { body, validationResult } from 'express-validator';
import { jwtAuth } from '../middleware/jwtAuth';
import { getAIAdvice } from '../services/aiService';

const router = express.Router();

router.post('/',
  jwtAuth,
  body('readinessScore').isNumeric(),
  body('roadmapDifficulty').isString(),
  body('userQuestion').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { readinessScore, roadmapDifficulty, userQuestion } = req.body;
    const aiResponse = await getAIAdvice({ readinessScore, roadmapDifficulty, userQuestion });
    res.json({ response: aiResponse });
  }
);

export default router;
