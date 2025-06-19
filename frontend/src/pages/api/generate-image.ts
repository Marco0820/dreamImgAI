import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { prompt, negative_prompt, style, aspect_ratio, color, composition, image_b64, reference_strength, turnstile_token } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }
    
    if (!turnstile_token) {
        return res.status(400).json({ message: 'Cloudflare Turnstile token is missing' });
    }

    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const fullUrl = `${backendUrl}/api/v1/images/generate/`;
        
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };

        const response = await axios.post(
            fullUrl,
            {
                prompt,
                negative_prompt,
                style,
                aspect_ratio,
                color,
                composition,
                image_b64,
                reference_strength,
                turnstile_token,
            },
            {
                headers: headers,
                timeout: 180000, // 3-minute timeout for the image generation
            }
        );

        res.status(200).json(response.data);

    } catch (error: any) {
        console.error('--- [generate-image] An error occurred ---');
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || error.message || 'An internal server error occurred.';
        
        console.error(`[generate-image] Error: ${status} - ${message}`);

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ message: 'Image generation service timed out. It may be busy, please try again later.' });
        }
        
        res.status(status).json({ message });
    }
} 