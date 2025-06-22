import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const FLUX_API_URL = 'https://fluximagegenerator.ai/api/flux1-dev/generate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { prompt, width, height } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const response = await axios.post(
            FLUX_API_URL,
            {
                prompt,
                width: width || 1024,
                height: height || 1024,
                steps: 30, // Default steps
                seed: Math.floor(Math.random() * 1000000),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 180000, // 3 minutes timeout
            }
        );

        res.status(200).json({ image: response.data.imageUrl });

    } catch (error: any) {
        console.error('--- [flux/generate] An error occurred ---');
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'An internal server error occurred.';
        
        console.error(`[flux/generate] Error: ${status} - ${message}`);
        res.status(status).json({ message });
    }
} 