import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma'; // Import prisma client

const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image";
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const GENERATION_COST = 1; // Define the cost for one generation (4 images)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!FIREWORKS_API_KEY) {
        console.error('[fireworks/generate] Server-side error: FIREWORKS_API_KEY is not configured.');
        return res.status(500).json({ message: 'The administrator has not configured the API key.' });
    }
    
    try {
        // 1. Authenticate the user
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user || !session.user.id) {
            return res.status(401).json({ error: 'Please log in to generate images.' });
        }

        // 2. Check user credits
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (user.credits < GENERATION_COST) {
            return res.status(402).json({ error: 'Insufficient credits. Please recharge.' });
        }

        const { prompt, negative_prompt, height, width } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // 3. Call the Fireworks AI API
        const requestBody = {
            prompt,
            negative_prompt,
            height: 1024, // Adjusted for 1:1 aspect ratio
            width: 1024,   // Adjusted for 1:1 aspect ratio
            samples: 4,
        };
        
        console.log(`[fireworks/generate] Submitting job to fireworks.ai:`, JSON.stringify(requestBody, null, 2));
        const fireworksResponse = await fetch(FIREWORKS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Json-Return-Image-Accept': 'image/png',
                'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!fireworksResponse.ok) {
            const errorText = await fireworksResponse.text();
            console.error(`[fireworks/generate] Error from fireworks.ai: ${fireworksResponse.status} - ${errorText}`);
            return res.status(fireworksResponse.status).json({ message: `Image generation service returned an error.`, details: errorText });
        }

        const responseData = await fireworksResponse.json();

        // 4. If API call is successful, deduct credits
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                credits: {
                    decrement: GENERATION_COST,
                },
            },
        });

        // 5. Return the image data to the frontend
        if (responseData.base64 && responseData.base64.length > 0) {
            const imageUrls = responseData.base64.map((base64String: string) => `data:image/png;base64,${base64String}`);
            return res.status(200).json({ images: imageUrls });
        } else {
            // This case should ideally not happen if the credit is deducted, but as a safeguard:
            console.error('[fireworks/generate] API call succeeded but no image data was returned.', responseData);
            // NOTE: Credits were still deducted here. This indicates an issue with the external API provider.
            return res.status(500).json({ message: 'API succeeded but returned no images. Credits were deducted.' });
        }

    } catch (error: any) {
        console.error('--- [fireworks/generate] An unexpected internal error occurred ---', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
}