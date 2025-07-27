import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getToken } from 'next-auth/jwt'; // Import getToken

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("--- [generate-image] API endpoint hit ---");
    console.log("[generate-image] Request Body:", JSON.stringify(req.body, null, 2));

    // --- Get the raw JWT token to pass to the backend ---
    const token = await getToken({ req, raw: true });

    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
    };

    if (token) {
        // If a session token exists, add it to the Authorization header
        headers['Authorization'] = `Bearer ${token}`;
        console.log("[generate-image] Auth token found, adding to backend request.");
    } else {
        console.log("[generate-image] No auth token found, proceeding as anonymous.");
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
        const fullUrl = `${backendUrl}/api/v1/images/generate/`;
        
        console.log(`[generate-image] Preparing to send request to backend at: ${fullUrl}`);

        const response = await axios.post(fullUrl, req.body, {
            headers: headers, // Use the new headers object
            timeout: 180000, // 3-minute timeout
        });

        console.log("[generate-image] Successfully received response from backend.");
        res.status(200).json(response.data);

    } catch (error: any) {
        console.error('--- [generate-image] An error occurred while proxying to the backend ---');
        
        if (axios.isAxiosError(error)) {
            console.error(`[generate-image] Axios error code: ${error.code}`);
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error(`[generate-image] Backend responded with status: ${error.response.status}`);
                console.error("[generate-image] Backend response data:", error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("[generate-image] No response received from backend. This strongly suggests a network issue, a firewall block, or that the backend server is down or crashed.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('[generate-image] Error setting up the request:', error.message);
            }
        } else {
            // A non-axios error
            console.error(`[generate-image] A non-Axios error occurred: ${error.message}`);
        }
        
        // Return a 502 error to the client
        res.status(502).json({ 
            message: 'Failed to communicate with the image generation service.',
            error: error.code || 'UNKNOWN_ERROR'
        });
    }
} 