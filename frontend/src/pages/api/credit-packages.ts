import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/creem/credit-packages`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      const statusCode = (error as any).response?.status || 500;
      const errorMessage = (error as any).response?.data?.detail || 'Failed to fetch credit packages';
      res.status(statusCode).json({ message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 