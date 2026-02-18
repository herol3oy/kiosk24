import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is missing!');
}

export const ENV = {
    API_BASE_URL,
    URLS_ENDPOINT: `${API_BASE_URL}/urls`,
    UPLOAD_ENDPOINT: `${API_BASE_URL}/upload_to_r2_bucket`,
    API_KEY,
};