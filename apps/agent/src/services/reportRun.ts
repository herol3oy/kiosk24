import type { RunMetadata } from '../../../../libs/shared/src/types';
import { ENV } from '../config/env';

export async function reportRunMetadata(metadata: RunMetadata) {
    try {
        console.log("Reporting run metadata to API...");

        const response = await fetch(`${ENV.API_BASE_URL}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ENV.API_KEY}`
            },
            body: JSON.stringify(metadata)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Failed to report run metadata: ${response.status} ${errorText}`
            );
        } else {
            console.log("Run metadata reported successfully.");
        }

    } catch (reportError) {
        console.error("Error reporting run metadata:", reportError);
    }
}
