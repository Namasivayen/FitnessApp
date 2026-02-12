import { JwtPayload } from 'jsonwebtoken';

// Extend Express Request to include user

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      } & JwtPayload;
    }
  }
}
