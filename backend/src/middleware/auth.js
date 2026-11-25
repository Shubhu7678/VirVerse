import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/token.js';

const ACTIVE_WRITE_INTERVAL_MS = 60 * 1000;

export default async function protect(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (user.isDemo && (!user.demoExpiresAt || user.demoExpiresAt <= new Date())) {
      return res.status(401).json({ message: 'This demo session has expired. Start a new demo to continue.' });
    }

    // Throttled so a busy session does not write on every request.
    const now = Date.now();
    if (!user.isDemo && (!user.lastActiveAt || now - user.lastActiveAt.getTime() > ACTIVE_WRITE_INTERVAL_MS)) {
      user.lastActiveAt = new Date(now);
      User.updateOne({ _id: user._id }, { lastActiveAt: user.lastActiveAt }).catch(() => {});
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}
