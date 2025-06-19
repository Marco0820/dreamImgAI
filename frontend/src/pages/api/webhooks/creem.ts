import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { buffer } from 'micro';

const prisma = new PrismaClient();

// Disable body parsing to access the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const verifyCreemWebhook = (req: NextApiRequest, rawBody: Buffer): boolean => {
    const signature = req.headers['creem-signature'] as string;
    const secret = process.env.CREEM_WEBHOOK_SECRET as string;

    if (!signature || !secret) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'hex');
    const receivedSignature = Buffer.from(signature, 'hex');

    // Use crypto.timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(digest, receivedSignature);
};

// Define constants for credits based on plan
const CREDITS_FOR_PLAN: { [key: string]: number } = {
    'price_pro': 1000,
    'price_ultimate': 5000,
    'price_enterprise': Infinity, // Or a very large number
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const rawBody = await buffer(req);
    const isVerified = verifyCreemWebhook(req, rawBody);
    if (!isVerified) {
        return res.status(401).json({ message: 'Webhook signature verification failed.' });
    }

    const event = JSON.parse(rawBody.toString());

    // Handle the 'checkout.session.completed' event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const priceId = session.price_id; // Assume Creem provides this

        if (!userId || !priceId) {
            return res.status(400).json({ message: 'Missing userId or priceId in webhook payload.' });
        }
        
        const creditsToAdd = CREDITS_FOR_PLAN[priceId] || 0;

        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    creemSubscriptionId: session.subscription_id,
                    creemPriceId: priceId,
                    creemCurrentPeriodEnd: new Date(session.current_period_end * 1000), // Assuming timestamp
                    credits: {
                        increment: creditsToAdd,
                    },
                },
            });
        } catch (error) {
            console.error('Failed to update user subscription from webhook:', error);
            return res.status(500).json({ message: 'Database error while updating user.' });
        }
    }

    res.status(200).json({ received: true });
} 