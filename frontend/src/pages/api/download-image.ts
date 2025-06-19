import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import sharp from 'sharp';
import { URL } from 'url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'Image URL is required.' });
    }

    try {
        // Fetch the image from the provided URL
        const imageResponse = await axios.get(url, {
            responseType: 'arraybuffer',
        });

        // Get the original filename from the URL path
        const urlPath = new URL(url).pathname;
        const originalFilename = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        const baseFilename = originalFilename.split('.').slice(0, -1).join('.');
        const downloadFilename = `${baseFilename || 'download'}.png`;

        // Convert image to PNG using sharp
        const pngBuffer = await sharp(imageResponse.data).png().toBuffer();

        // Set headers for file download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        
        // Send the converted image buffer
        res.status(200).send(pngBuffer);

    } catch (error) {
        console.error('Error downloading or converting image:', error);
        res.status(500).json({ message: 'Failed to process image.' });
    }
} 