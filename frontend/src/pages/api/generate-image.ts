import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("--- [generate-image] API endpoint hit (with session verification) ---");

  const session = await getServerSession(req, res, authOptions);

  // --- KEY CHANGE: Verify session on the server-side first ---
  if (!session || !session.user || !session.user.id) {
    console.warn("[generate-image] Unauthorized: No valid session or user ID found.");
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    // --- KEY CHANGE: Pass verified user info in headers to the backend ---
    'X-User-Id': session.user.id,
  };
  if (session.user.email) {
    headers['X-User-Email'] = session.user.email;
  }

  console.log(`[generate-image] Session verified for user ID: ${session.user.id}. Forwarding to backend.`);

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fullUrl = `${backendUrl}/api/v1/images/generate/`;
    
    // The original request body from the client is passed through
    const response = await axios.post(fullUrl, req.body, {
      headers: headers,
      timeout: 180000,
    });
    
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