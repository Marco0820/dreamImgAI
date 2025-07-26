import { NextApiRequest, NextApiResponse } from 'next';
import fluxGenerateHandler from './ttapi/flux/generate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Forward the request to the new ttapi flux generation handler
    return fluxGenerateHandler(req, res);
} 