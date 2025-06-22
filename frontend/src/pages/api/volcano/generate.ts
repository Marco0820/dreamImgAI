import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import crypto from 'crypto';

// TODO: Replace with environment variables
const VOLCANO_ACCESS_KEY_ID = process.env.VOLCANO_ACCESS_KEY_ID || '';
const VOLCANO_SECRET_ACCESS_KEY = process.env.VOLCANO_SECRET_ACCESS_KEY || '';

const VOLCANO_API_URL = 'https://visual.volcengineapi.com';
const SERVICE = "cv";
const REGION = "cn-north-1";
const HOST = "visual.volcengineapi.com";
const ACTION = "CVProcess";
const VERSION = "2022-08-31";


// Function to generate the signature (based on the Python example)
const getSignature = (requestBody: string, query: Record<string, string>) => {
    const method = "POST";
    const contentType = "application/json";
    const t = new Date();
    
    const date = t.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
    const shortDate = date.substring(0, 8); // YYYYMMDD

    // Step 1: Create Canonical Request
    const payloadHash = crypto.createHash('sha256').update(requestBody).digest('hex');
    const canonicalUri = '/';
    const canonicalQuery = Object.keys(query).sort().map(key => `${key}=${query[key]}`).join('&');
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';
    
    const canonicalHeaders = [
        `content-type:${contentType}`,
        `host:${HOST}`,
        `x-content-sha256:${payloadHash}`,
        `x-date:${date}`
    ].join('\n') + '\n';

    const canonicalRequest = [
        method,
        canonicalUri,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // Step 2: Create String to Sign
    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${shortDate}/${REGION}/${SERVICE}/request`;
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const stringToSign = [
        algorithm,
        date,
        credentialScope,
        hashedCanonicalRequest
    ].join('\n');

    // Step 3: Calculate Signature
    const kDate = crypto.createHmac('sha256', VOLCANO_SECRET_ACCESS_KEY).update(shortDate).digest();
    const kRegion = crypto.createHmac('sha256', kDate as any).update(REGION).digest();
    const kService = crypto.createHmac('sha256', kRegion as any).update(SERVICE).digest();
    const kSigning = crypto.createHmac('sha256', kService as any).update('request').digest();
    const signature = crypto.createHmac('sha256', kSigning as any).update(stringToSign).digest('hex');

    // Step 4: Build Authorization Header
    const authorization = `${algorithm} Credential=${VOLCANO_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log("--- Signature Generation Details ---");
    console.log("Timestamp:", date);
    console.log("Short Date:", shortDate);
    console.log("Payload Hash:", payloadHash);
    console.log("Canonical Request:\n", canonicalRequest);
    console.log("String to Sign:\n", stringToSign);
    console.log("Final Signature:", signature);
    console.log("Final Authorization Header:", authorization);
    console.log("---------------------------------");

    return {
        'Authorization': authorization,
        'X-Date': date,
        'X-Content-Sha256': payloadHash,
        'Content-Type': contentType
    };
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    if (!VOLCANO_ACCESS_KEY_ID || !VOLCANO_SECRET_ACCESS_KEY) {
        return res.status(500).json({ message: 'Volcano Engine API keys are not configured.' });
    }

    const { prompt, width, height } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const bodyParams = {
            req_key: "high_aes_general_v30l_zt2i",
            prompt: prompt,
            width: width || 1024,
            height: height || 1024,
            return_url: true,
            seed: -1,
            scale: 2.5,
        };
        const requestBody = JSON.stringify(bodyParams);

        const queryParams: { [key: string]: string } = {
            Action: ACTION,
            Version: VERSION
        };
        
        const headers = getSignature(requestBody, queryParams);
        
        const canonicalQuery = Object.keys(queryParams).sort().map(key => `${key}=${queryParams[key]}`).join('&');
        
        const response = await axios.post(
            `${VOLCANO_API_URL}?${canonicalQuery}`,
            requestBody,
            { headers }
        );

        const responseData = response.data;
        
        if (responseData.code !== 10000) {
            // See error codes in docs
            console.error('[volcano/generate] API Error:', responseData);
            let message = responseData.message || 'An unknown error occurred';
            if (responseData.data?.algorithm_base_resp?.status_message) {
                message = responseData.data.algorithm_base_resp.status_message;
            }
            throw new Error(message);
        }

        const imageUrl = responseData.data?.image_urls?.[0];

        if (!imageUrl) {
            throw new Error('No image URL found in the response.');
        }

        res.status(200).json({ image: imageUrl });

    } catch (error: any) {
        console.error('--- [volcano/generate] An error occurred ---');
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'An internal server error occurred.';
        
        console.error(`[volcano/generate] Error: ${status} - ${message}`);
        if(error.response?.data) {
            console.error('[volcano/generate] Full API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(status).json({ message });
    }
} 