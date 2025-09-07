import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("--- [generate-image] API endpoint hit (with session verification) ---");

  const session = await getServerSession(req, res, authOptions);

  // --- 暂时允许匿名用户生成图片 ---
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  if (session && session.user && session.user.id) {
    // 如果用户已登录，传递用户信息
    headers['X-User-Id'] = session.user.id;
    if (session.user.email) {
      headers['X-User-Email'] = session.user.email;
    }
    console.log(`[generate-image] Session verified for user ID: ${session.user.id}. Forwarding to backend.`);
  } else {
    // 匿名用户
    console.log("[generate-image] Anonymous user request. Forwarding to backend.");
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fullUrl = `${backendUrl}/api/v1/images/generate/`;
    
    console.log(`[generate-image] Attempting to connect to backend: ${fullUrl}`);
    
    // The original request body from the client is passed through
    const response = await axios.post(fullUrl, req.body, {
      headers: headers,
      timeout: 180000,
      validateStatus: function (status) {
        return status < 600; // Accept all status codes less than 600
      }
    });
    
    // Handle backend errors more gracefully
    if (response.status >= 400) {
      console.error(`[generate-image] Backend returned error status: ${response.status}`);
      console.error(`[generate-image] Backend error response:`, response.data);
      
      // Return the backend error to the client
      return res.status(response.status).json(response.data);
    }
    
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
        
        // Return a more specific error to the client
        let errorMessage = 'Failed to communicate with the image generation service.';
        let statusCode = 502;
        
        if (error.response) {
            // Backend responded with an error
            statusCode = error.response.status;
            errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
        } else if (error.request) {
            // No response received - likely backend is down
            errorMessage = 'Backend service is not responding. Please check if the backend server is running.';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to backend service. Please ensure the backend is running on the correct port.';
        }
        
        res.status(statusCode).json({ 
            message: errorMessage,
            error: error.code || 'UNKNOWN_ERROR',
            details: error.response?.data || null
        });
  }
} 