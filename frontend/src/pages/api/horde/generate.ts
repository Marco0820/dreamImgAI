import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const HORDE_API_URL = 'https://stablehorde.net/api/v2';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { prompt, negative_prompt, width, height } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // Step 1: Request image generation
        const generateResponse = await axios.post(
            `${HORDE_API_URL}/generate/async`,
            {
                prompt: prompt,
                params: {
                    sampler_name: 'k_dpmpp_2s_a',
                    cfg_scale: 5,
                    steps: 50,
                    width: width || 1024,
                    height: height || 1024,
                    models: ['stable_diffusion_xl'],
                },
                nsfw: false,
                censor_nsfw: true,
                payload: {
                    negative_prompt: negative_prompt || '',
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': '0000000000',
                    'Client-Agent': 'DreamImg-AI/1.0;contact@dreamimg.ai'
                },
            }
        );

        const generationId = generateResponse.data.id;
        if (!generationId) {
            throw new Error('Failed to start generation job.');
        }

        // Step 2: Poll for the result
        let result = null;
        const startTime = Date.now();
        const timeout = 180000; // 3 minutes

        while (Date.now() - startTime < timeout) {
            await sleep(5000); // Poll every 5 seconds
            const checkResponse = await axios.get(`${HORDE_API_URL}/generate/check/${generationId}`);
            const checkData = checkResponse.data;

            if (checkData.done) {
                const statusResponse = await axios.get(`${HORDE_API_URL}/generate/status/${generationId}`);
                result = statusResponse.data;
                break;
            }

            if (checkData.faulted) {
                throw new Error('Image generation failed or was cancelled.');
            }
        }

        if (!result) {
            throw new Error('Image generation timed out.');
        }

        if (!result.generations || result.generations.length === 0) {
            throw new Error('No image was generated.');
        }
        
        const finalImage = result.generations[0];
        if (finalImage.cimg || finalImage.censored) {
             return res.status(403).json({ message: 'Generated image was censored or failed safety checks.' });
        }
        
        // The API returns an webp, but the frontend expects a URL. I will return the URL.
        const imageUrl = finalImage.img;

        res.status(200).json({ image: imageUrl });

    } catch (error: any) {
        console.error('--- [horde/generate] An error occurred ---');
        const status = error.response?.status || 500;
        let message = error.response?.data?.message || error.message || 'An internal server error occurred.';
        
        if (error.code === 'ECONNABORTED') {
            message = 'AI Horde service timed out.';
        }
        
        console.error(`[horde/generate] Error: ${status} - ${message}`);
        res.status(status).json({ message });
    }
} 