import express from 'express';
import { body, validationResult } from 'express-validator';
import { Roadmap } from '../models/Roadmap';
import { UserRoadmap } from '../models/UserRoadmap';
import { jwtAuth } from '../middleware/jwtAuth';
import mongoose from 'mongoose';

const router = express.Router();

// --- Helpers ---
const DIFFICULTY_DURATION: Record<string, number> = {
  beginner: 8,
  intermediate: 12,
  advanced: 16,
};

import { Request } from 'express';

function isAdmin(req: Request) {
  // @ts-ignore
  return req.user && req.user.role === 'admin';
}

// --- Admin: Create Roadmap ---
router.post(
  '/admin',
  jwtAuth,
  body('roadmapId').isString(),
  body('domain').isString(),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  body('phases').isArray(),
  body('version').isString(),
  body('createdByAdmin').isBoolean(),
  body('isActive').isBoolean(),
  async (req: express.Request, res: express.Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { roadmapId, domain, difficulty, phases, version, createdByAdmin, isActive } = req.body;
    const fixedDurationWeeks = DIFFICULTY_DURATION[difficulty];
    try {
      const roadmap = await Roadmap.create({ roadmapId, domain, difficulty, phases, version, createdByAdmin, isActive, fixedDurationWeeks });
      res.status(201).json(roadmap);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// --- Admin: Version Roadmap ---
router.post(
  '/admin/version',
  jwtAuth,
  body('roadmapId').isString(),
  body('version').isString(),
  async (req: express.Request, res: express.Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    const { roadmapId, version } = req.body;
    try {
      const roadmap = await Roadmap.findOne({ roadmapId });
      if (!roadmap) return res.status(404).json({ error: 'Not found' });
      // Create a new roadmap with incremented version
      const newRoadmap = roadmap.toObject();
      if ('_id' in newRoadmap) {
        // @ts-ignore
        delete newRoadmap._id;
      }
      newRoadmap.version = version;
      const created = await Roadmap.create(newRoadmap);
      res.status(201).json(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// --- Admin: Activate/Deactivate Roadmap ---
router.patch(
  '/admin/activate',
  jwtAuth,
  body('roadmapId').isString(),
  body('isActive').isBoolean(),
  async (req: express.Request, res: express.Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    const { roadmapId, isActive } = req.body;
    try {
      const roadmap = await Roadmap.findOneAndUpdate({ roadmapId }, { isActive }, { new: true });
      if (!roadmap) return res.status(404).json({ error: 'Not found' });
      res.json(roadmap);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

// --- User: List Roadmaps (read-only) ---
router.get('/', jwtAuth, async (req: express.Request, res: express.Response) => {
  try {
    const roadmaps = await Roadmap.find({ isActive: true });
    res.json(roadmaps);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// --- User: Select Roadmap ---
router.post(
  '/select',
  jwtAuth,
  body('roadmapId').isString(),
  async (req: Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
    const { roadmapId } = req.body;
    // Only one active roadmap per user
    const active = await UserRoadmap.findOne({ userId, status: 'active' });
    if (active) return res.status(409).json({ error: 'Already have an active roadmap' });
    const roadmap = await Roadmap.findOne({ roadmapId, isActive: true });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    const userRoadmap = await UserRoadmap.create({ userId, roadmapId, startDate: new Date(), status: 'active' });
    res.status(201).json(userRoadmap);
  }
);

// --- User: Lock Roadmap (archive current) ---
router.post('/lock', jwtAuth, async (req: Request, res: express.Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const active = await UserRoadmap.findOne({ userId, status: 'active' });
  if (!active) return res.status(404).json({ error: 'No active roadmap' });
  active.status = 'archived';
  await active.save();
  res.json({ message: 'Roadmap archived' });
});

// --- User: Switch Roadmap (archive previous, select new) ---
router.post(
  '/switch',
  jwtAuth,
  body('roadmapId').isString(),
  async (req: Request, res: express.Response) => {
    // @ts-ignore
    const userId = req.user.id;
    const { roadmapId } = req.body;
    // Archive current
    const active = await UserRoadmap.findOne({ userId, status: 'active' });
    if (active) {
      active.status = 'archived';
      await active.save();
    }
    // Select new
    const roadmap = await Roadmap.findOne({ roadmapId, isActive: true });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    const userRoadmap = await UserRoadmap.create({ userId, roadmapId, startDate: new Date(), status: 'active' });
    res.status(201).json(userRoadmap);
  }
);

export default router;