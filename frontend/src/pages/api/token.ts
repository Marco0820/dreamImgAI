import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const FAKE_USERS = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
    is_premium: false,
  },
  {
    id: 2,
    email: 'premium@example.com',
    password: 'password123',
    name: 'Premium User',
    is_premium: true,
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-chars';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method Not Allowed' });
  }

  // The authSlice sends data as x-www-form-urlencoded, so it's in req.body
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const user = FAKE_USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }

  // Don't include password in the token payload
  const userForToken = {
    id: user.id,
    email: user.email,
    name: user.name,
    is_premium: user.is_premium,
  };

  const accessToken = jwt.sign(userForToken, JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({
    access_token: accessToken,
    token_type: 'bearer',
  });
} 