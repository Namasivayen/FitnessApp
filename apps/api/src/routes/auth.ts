import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { sendOTP } from '../services/smsService';
import mongoose from 'mongoose';

const router = express.Router();

// In-memory stores for demo (replace with persistent store in production)
const emailVerifications = new Map<string, string>(); // email -> token
const mobileOTPs = new Map<string, string>(); // mobile -> otp
const passwordResetTokens = new Map<string, string>(); // email -> token
const passwordResetOTPs = new Map<string, string>(); // mobile -> otp

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = '1h';

// --- Registration: Email ---
router.post('/register/email',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, role: 'user', profileCompleted: false });
    const token = crypto.randomBytes(32).toString('hex');
    emailVerifications.set(email, token);
    const link = `${req.protocol}://${req.get('host')}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    await sendVerificationEmail(email, link);
    res.status(201).json({ message: 'Verification email sent' });
  }
);

router.get('/verify-email', async (req, res) => {
  const { email, token } = req.query;
  if (!email || !token) return res.status(400).json({ error: 'Missing params' });
  const stored = emailVerifications.get(email as string);
  if (stored !== token) return res.status(400).json({ error: 'Invalid token' });
  await User.updateOne({ email }, { $set: { profileCompleted: true } });
  emailVerifications.delete(email as string);
  res.json({ message: 'Email verified' });
});

// --- Registration: Mobile ---
router.post('/register/mobile',
  body('mobile').isMobilePhone('any'),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { mobile, password } = req.body;
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(409).json({ error: 'Mobile already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ mobile, passwordHash, role: 'user', profileCompleted: false });
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    mobileOTPs.set(mobile, otp);
    await sendOTP(mobile, otp);
    res.status(201).json({ message: 'OTP sent' });
  }
);

router.post('/verify-mobile',
  body('mobile').isMobilePhone('any'),
  body('otp').isLength({ min: 6, max: 6 }),
  async (req, res) => {
    const { mobile, otp } = req.body;
    const stored = mobileOTPs.get(mobile);
    if (stored !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    await User.updateOne({ mobile }, { $set: { profileCompleted: true } });
    mobileOTPs.delete(mobile);
    res.json({ message: 'Mobile verified' });
  }
);

// --- Login: Email ---
router.post('/login/email',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.profileCompleted) return res.status(403).json({ error: 'Email not verified' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token });
  }
);

// --- Login: Mobile ---
router.post('/login/mobile',
  body('mobile').isMobilePhone('any'),
  body('password').exists(),
  async (req, res) => {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.profileCompleted) return res.status(403).json({ error: 'Mobile not verified' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token });
  }
);

// --- Forgot Password: Email ---
router.post('/forgot/email',
  body('email').isEmail(),
  async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = crypto.randomBytes(32).toString('hex');
    passwordResetTokens.set(email, token);
    const link = `${req.protocol}://${req.get('host')}/api/auth/reset-password/email?email=${encodeURIComponent(email)}&token=${token}`;
    await sendPasswordResetEmail(email, link);
    res.json({ message: 'Password reset link sent' });
  }
);

router.post('/reset-password/email',
  body('email').isEmail(),
  body('token').exists(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const { email, token, newPassword } = req.body;
    const stored = passwordResetTokens.get(email);
    if (stored !== token) return res.status(400).json({ error: 'Invalid token' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { $set: { passwordHash } });
    passwordResetTokens.delete(email);
    // Invalidate sessions: (implementation depends on session store, here just a placeholder)
    res.json({ message: 'Password reset successful' });
  }
);

// --- Forgot Password: Mobile ---
router.post('/forgot/mobile',
  body('mobile').isMobilePhone('any'),
  async (req, res) => {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    passwordResetOTPs.set(mobile, otp);
    await sendOTP(mobile, otp);
    res.json({ message: 'OTP sent' });
  }
);

router.post('/reset-password/mobile',
  body('mobile').isMobilePhone('any'),
  body('otp').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const { mobile, otp, newPassword } = req.body;
    const stored = passwordResetOTPs.get(mobile);
    if (stored !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ mobile }, { $set: { passwordHash } });
    passwordResetOTPs.delete(mobile);
    // Invalidate sessions: (implementation depends on session store, here just a placeholder)
    res.json({ message: 'Password reset successful' });
  }
);

export default router;
