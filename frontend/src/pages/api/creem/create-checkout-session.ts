import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/auth'; // Using our new auth config
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This function now makes a real call to the Creem API
const createCreemCheckoutSession = async (priceId: string, userEmail: string, userId: string) => {
    // In a real scenario, you would make a POST request to Creem's API
    const response = await fetch('https://api.creem.io/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.CREEM_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            price_id: priceId,
            customer_email: userEmail,
            client_reference_id: userId, // Pass our user ID for webhook reference
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Creem API Error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = await auth(req, res);
    if (!session?.user?.email || !session?.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { priceId } = req.body;
    if (!priceId) {
        return res.status(400).json({ message: 'Price ID is required' });
    }

    try {
        const { checkout_url } = await createCreemCheckoutSession(priceId, session.user.email, session.user.id);
        res.status(200).json({ checkoutUrl: checkout_url });
    } catch (error: any) {
        console.error('Creem checkout session creation failed:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
} 