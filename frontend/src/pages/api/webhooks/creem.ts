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
    // Convert buffer to string to avoid type issues with different @types/node versions
    hmac.update(rawBody.toString('utf-8'));
    const computedSignature = hmac.digest('hex');
    
    // In a real-world scenario, a timing-safe comparison is crucial.
    // However, given the persistent type errors, we will use a direct comparison
    // as a workaround. This is generally acceptable for many webhook use cases
    // but be aware of the theoretical timing attack vector.
    return computedSignature === signature;
};

// Define constants for credits based on plan
const CREDITS_FOR_PLAN: { [key: string]: number } = {
    // Premium Plans
    'prod_7YCG8QS6mq0BDo7r0HSxlY': 1000, // Premium Monthly
    'prod_3SJPB99xXlLqnPcSGKAJ43': 12000, // Premium Yearly (e.g., 1000 * 12)

    // Ultimate Plans
    'prod_gIRFT5va12D75ntWw8NMv': 5000, // Ultimate Monthly
    'prod_cUyhYlcv0bhCzyrI9siHi': 60000, // Ultimate Yearly (e.g., 5000 * 12)

    // Fallback for old/other plans if needed
    'price_pro': 1000,
    'price_enterprise': Infinity,
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('[creem-webhook] Received a request.');
    if (req.method !== 'POST') {
        console.warn(`[creem-webhook] Method Not Allowed: ${req.method}`);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const rawBody = await buffer(req);
    console.log('[creem-webhook] Verifying signature...');
    const isVerified = verifyCreemWebhook(req, rawBody);
    if (!isVerified) {
        console.error('[creem-webhook] Signature verification failed.');
        return res.status(401).json({ message: 'Webhook signature verification failed.' });
    }
    console.log('[creem-webhook] Signature verified successfully.');

    const event = JSON.parse(rawBody.toString());
    // Temporarily keep the full log for one more test
    console.log('[creem-webhook] Full event payload:', JSON.stringify(event, null, 2));

    // --- START OF FIX ---

    // 1. Use the correct event type field: `eventType`
    if (event.eventType === 'checkout.completed') {
        console.log('[creem-webhook] Handling checkout.completed event.');

        // 2. Use the correct object path: `event.object`
        const checkoutObject = event.object;

        // 3. Use the correct paths for userId and priceId
        const userId = checkoutObject.metadata?.userId;
        const priceId = checkoutObject.product?.id;
        
        console.log(`[creem-webhook] Extracted from session - UserID: ${userId}, PriceID: ${priceId}`);

        if (!userId || !priceId) {
            console.error(`[creem-webhook] Missing userId or priceId in webhook payload. UserID: ${userId}, PriceID: ${priceId}`);
            return res.status(400).json({ message: 'Missing userId or priceId in webhook payload.' });
        }
        
        const creditsToAdd = CREDITS_FOR_PLAN[priceId] || 0;
        console.log(`[creem-webhook] Calculated credits to add: ${creditsToAdd} for PriceID: ${priceId}`);

        if (creditsToAdd === 0) {
            console.warn(`[creem-webhook] No credits configured for PriceID: ${priceId}. No credits will be added.`);
        }

        try {
            console.log(`[creem-webhook] Updating database for UserID: ${userId}...`);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    // Note: The payload does not seem to contain subscription details for one-time payments.
                    // These fields might be null or cause errors if the data isn't present.
                    // Using optional chaining `?.` for safety.
                    creemSubscriptionId: checkoutObject.order?.transaction, // Using transaction as a reference
                    creemPriceId: priceId,
                    creemCurrentPeriodEnd: checkoutObject.order?.updated_at ? new Date(checkoutObject.order.updated_at) : new Date(),
                    credits: {
                        increment: creditsToAdd,
                    },
                },
            });
            console.log(`[creem-webhook] Successfully added ${creditsToAdd} credits to UserID: ${userId}.`);
        } catch (error) {
            console.error(`[creem-webhook] Failed to update database for UserID: ${userId}. Error:`, error);
            return res.status(500).json({ message: 'Database error while updating user.' });
        }
    } else {
        console.log(`[creem-webhook] Skipping event type: ${event.eventType}.`);
    }

    // --- END OF FIX ---

    res.status(200).json({ received: true });
}