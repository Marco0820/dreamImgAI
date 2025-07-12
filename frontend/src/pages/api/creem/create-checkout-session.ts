import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Adjust this path to your auth options

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('[create-checkout-session] Received request');
    if (req.method !== 'POST') {
        console.warn('[create-checkout-session] Method Not Allowed:', req.method);
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user) {
            console.error('[create-checkout-session] Unauthorized: No session or user found.');
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`[create-checkout-session] Session found for user: ${session.user.id}`);

        const { priceId: productId } = req.body;
        if (!productId) {
            console.error('[create-checkout-session] Bad Request: Product ID is required.');
            return res.status(400).json({ error: 'Product ID is required' });
        }
        console.log(`[create-checkout-session] Product ID received: ${productId}`);
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const checkoutPayload = {
            product_id: productId,
            success_url: `${baseUrl}/`, // Simplified as per the final analysis
            // Pass both userId and email in metadata for robust user matching in webhook
            metadata: {
                userId: session.user.id,
                userEmail: session.user.email,
            }
        };
        console.log('[create-checkout-session] Creating checkout payload:', checkoutPayload);

        const creemApiKey = process.env.CREEM_API_KEY;
        if (!creemApiKey) {
            console.error("[create-checkout-session] Creem API key is not configured.");
            throw new Error("Server configuration error.");
        }

        const response = await fetch('https://test-api.creem.io/v1/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': creemApiKey,
            },
            body: JSON.stringify(checkoutPayload),
        });
        console.log(`[create-checkout-session] Response from Creem API: ${response.status}`);

        const creemResponse = await response.json();

        if (!response.ok) {
            console.error('Creem checkout session creation failed:', {
                status: response.status,
                statusText: response.statusText,
                body: creemResponse
            });
            const errorMessage = creemResponse.message || `Creem API Error: ${response.status}`;
            return res.status(500).json({ error: errorMessage });
        }

        const checkout_url = creemResponse.checkout_url; // Corrected from .url to .checkout_url
        if (!checkout_url) {
            console.error('[create-checkout-session] Checkout URL not found in Creem response:', creemResponse);
            return res.status(500).json({ error: 'Failed to retrieve checkout URL from Creem.' });
        }
        
        console.log(`[create-checkout-session] Successfully created checkout session. URL: ${checkout_url}`);
        res.status(200).json({ checkout_url: checkout_url });

    } catch (error: any) {
        console.error('[create-checkout-session] Unhandled error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
