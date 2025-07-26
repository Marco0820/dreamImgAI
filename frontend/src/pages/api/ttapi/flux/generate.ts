import { NextApiRequest, NextApiResponse } from 'next';

const TT_GENERATE_URL = 'https://api.ttapi.io/flux/generate';
const TT_FETCH_URL = 'https://api.ttapi.io/flux/fetch';
const TT_API_KEY = process.env.TT_API_KEY;

// Helper function to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJobResult(jobId: string): Promise<any> {
    console.log(`[ttapi/flux/fetch] Fetching result for jobId: ${jobId}`);
    const response = await fetch(TT_FETCH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'TT-API-KEY': TT_API_KEY!,
        },
        body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ttapi/flux/fetch] Error fetching job result: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch job result: ${errorText}`);
    }

    return response.json();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!TT_API_KEY) {
        console.error('[ttapi/flux/generate] Server-side error: TT_API_KEY is not configured.');
        return res.status(500).json({ message: 'The administrator has not configured the API key.' });
    }

    const { prompt, negative_prompt, style, aspect_ratio, color, composition } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    const final_prompt = [prompt, style, color, composition].filter(Boolean).join(', ');
    const sizeMap: { [key: string]: string } = { '1:1': '1024x1024', '16:9': '1792x1024', '9:16': '1024x1792' };
    const size = sizeMap[aspect_ratio] || '1024x1024';

    try {
        const requestBody = { 
            prompt: final_prompt, 
            negative_prompt: negative_prompt, 
            mode: 'flux1-schnell', 
            aspect_ratio: aspect_ratio || '1:1',
        };
        
        console.log(`[ttapi/flux/generate] Submitting job to ttapi.io:`, JSON.stringify(requestBody, null, 2));
        const generateResponse = await fetch(TT_GENERATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'TT-API-KEY': TT_API_KEY },
            body: JSON.stringify(requestBody),
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            console.error(`[ttapi/flux/generate] Error submitting job: ${generateResponse.status} - ${errorText}`);
            return res.status(generateResponse.status).json({ message: `Failed to submit job to image generation service.`, details: errorText });
        }

        const generateData = await generateResponse.json();
        const jobId = generateData.data?.jobId;

        if (!jobId) {
            console.error('[ttapi/flux/generate] Failed to get jobId from submission response.', generateData);
            return res.status(500).json({ message: 'Failed to retrieve Job ID after submission.' });
        }

        console.log(`[ttapi/flux/generate] Job submitted successfully. Job ID: ${jobId}. Starting to poll for results...`);

        // Polling for the result
        const maxAttempts = 30; // 30 attempts * 3 seconds = 90 seconds max wait time
        let attempt = 0;

        while (attempt < maxAttempts) {
            await sleep(3000); // Wait for 3 seconds before each fetch
            attempt++;
            console.log(`[ttapi/flux/generate] Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
            
            const resultData = await fetchJobResult(jobId);

            // According to docs, status can be ON_QUEUE, SUCCESS, FAILED
            if (resultData.status === 'SUCCESS' && resultData.data?.imageUrl) {
                console.log(`[ttapi/flux/generate] Job ${jobId} completed successfully!`);
                return res.status(200).json({ image: resultData.data.imageUrl });
            } else if (resultData.status === 'ON_QUEUE') {
                // Continue polling
                console.log(`[ttapi/flux/generate] Job ${jobId} is still ON_QUEUE.`);
            } else if (resultData.status === 'FAILED') {
                console.error(`[ttapi/flux/generate] Job ${jobId} failed.`, resultData);
                return res.status(500).json({ message: 'Image generation job failed.' });
            }
             else {
                // Handle other unexpected statuses
                console.log(`[ttapi/flux/generate] Job ${jobId} has an unexpected status: ${resultData.status}. Continuing to poll.`);
            }
        }

        return res.status(504).json({ message: 'Image generation timed out after 90 seconds.' });

    } catch (error: any) {
        console.error('--- [ttapi/flux/generate] An unexpected internal error occurred ---', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
} 