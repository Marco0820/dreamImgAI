import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("[user/credits] API endpoint hit. Fetching session...");
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    console.warn("[user/credits] Unauthorized request: No session found.");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  console.log(`[user/credits] Session found for user ID: ${userId}. Fetching credits from DB...`);
  
  // --- KEY FIX: Add defensive check for userId ---
  if (!userId) {
    console.error(`[user/credits] Critical error: Session exists but user ID is undefined.`);
    return res.status(400).json({ error: 'Invalid session: User ID is missing.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        credits: true,
      },
    });

    if (!user) {
      console.error(`[user/credits] User not found in DB with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[user/credits] Successfully fetched credits for user ${userId}. Credits: ${user.credits}`);
    res.status(200).json({ credits: user.credits });
  } catch (error) {
    console.error(`[user/credits] Error fetching user credits for user ${userId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}