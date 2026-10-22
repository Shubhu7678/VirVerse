import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'token';

const cookieOptions = (maxAge = 7 * 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge,
});

export function signToken(userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

export function setAuthCookie(res, userId, { maxAge, expiresIn } = {}) {
  res.cookie(COOKIE_NAME, signToken(userId, expiresIn), cookieOptions(maxAge));
}

export function clearAuthCookie(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
}
