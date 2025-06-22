import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TT_API_URL = 'https://api.ttapi.io/flux/fetch';
const TT_API_KEY = process.env.TT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { jobId } = req.body.jobId ? req.body : req.query;

    if (!jobId) {
        return res.status(400).json({ message: 'jobId is required' });
    }

    if (!TT_API_KEY) {
        return res.status(500).json({ message: 'TT_API_KEY is not configured' });
    }

    try {
        const response = await axios.post(
            TT_API_URL,
            {
                jobId,
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
        console.error('--- [ttapi/flux/fetch] An error occurred ---');
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'An internal server error occurred.';
        
        console.error(`[ttapi/flux/fetch] Error: ${status} - ${message}`);
        res.status(status).json({ message });
    }
} 