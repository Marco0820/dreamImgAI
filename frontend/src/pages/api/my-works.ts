import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth" // Corrected import path
import { JWT } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log("[api/my-works] Session lookup started...");
    const session = await getServerSession(req, res, authOptions);

    // --- KEY CHANGE: Check for session.user instead of session.accessToken ---
    if (!session || !session.user) {
        console.warn("[api/my-works] Unauthorized: No session or user found.");
        return res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }
    
    // For now, we'll assume authentication is successful and return mock data
    // because the backend logic for /my-works/ and its required token are not implemented yet.
    console.log(`[api/my-works] Authorized successfully for user: ${session.user.id}`);
    
    // TODO: Implement the actual backend call to `/api/v1/images/my-works/`
    // You will likely need to pass the NextAuth JWT session token, not an OAuth access token.

    const mockData = [
        // Example structure
        { id: 1, url: "https://via.placeholder.com/1024.png?text=My+Work+1", prompt: "A mock image" },
        { id: 2, url: "https://via.placeholder.com/1024.png?text=My+Work+2", prompt: "Another mock image" },
    ];

    res.status(200).json(mockData);

    /*
    // --- Temporarily disabled backend call ---
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'; // Corrected IP
        const fullUrl = `${backendUrl}/api/v1/images/my-works/`;
        
        // This part needs review. For credentials auth, you might need to send
        // the session JWT itself, or the backend needs another way to verify the user.
        const token = "some_valid_token_for_backend"; // Placeholder

        const response = await axios.get(fullUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000,
        });

        res.status(200).json(response.data);

    } catch (error: any) {
        // ... (error handling)
    }
    */
} 