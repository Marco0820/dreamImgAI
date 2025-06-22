import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TT_API_URL = 'https://api.ttapi.io/flux/generate';
const TT_API_KEY = process.env.TT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { prompt, size, model } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!TT_API_KEY) {
        console.error('[ttapi/flux/generate] Server-side error: TT_API_KEY is not configured. Please set it in your .env.local file.');
        return res.status(500).json({ message: 'TT_API_KEY is not configured' });
    }

    try {
        const response = await axios.post(
            TT_API_URL,
            {
                prompt,
                size: size || '1024x1024',
                model: 'flux1-schnell',
                mode: 'flux1-schnell',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'TT-API-KEY': TT_API_KEY,
                },
                timeout: 180000, // 3 minutes timeout
            }
        );

        res.status(200).json(response.data);

    } catch (error: any) {
        console.error('--- [ttapi/flux/generate] An error occurred ---');
        
        let status = 500;
        let message = 'An internal server error occurred.';

        if (axios.isAxiosError(error)) {
            console.error('Axios error calling ttapi.io:');
            status = error.response?.status || 500;
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                // Try to extract a meaningful message from the response
                message = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request data:', error.request);
                message = 'No response from ttapi.io server. It might be down or unreachable.';
            } else {
                // Something happened in setting up the request that triggered an Error
                message = error.message;
            }
        } else {
             // Not an axios error
            console.error('Non-Axios error:', error);
            message = error.message || 'An unknown error occurred.';
        }
        
        console.error(`[ttapi/flux/generate] Replying with status ${status} and message: "${message}"`);
        res.status(status).json({ message });
    }
} 