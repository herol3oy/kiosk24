import { BrowserContext, Page } from 'playwright';
import { UrlEntry } from '../../../../libs/shared/src/types';
import { getJsCleanup } from '../utils/getJsCleanup';
import { getUrlKey } from '../utils/getUrlKey';
import { JPEG_QUALITY } from '../constants/jpeg-quality';
import { uploadScreenshot } from '../services/uploadScreenshot';

export async function processSingleUrl(
    contextsByDevice: Record<string, BrowserContext>,
    urlData: UrlEntry,
    timestampIso: string
) {
    const { id: url_id, url, language } = urlData;
    const capturedAt = new Date().toISOString();
    const urlKey = getUrlKey(url);

    const devicePromises = Object.entries(contextsByDevice).map(async ([deviceName, context]) => {
        const objectKey = `${urlKey}/${deviceName}/${timestampIso}.jpg`;
        let page: Page | null = null;

        try {
            console.log(`[${new Date().toISOString()}] Capturing ${url} [${language}] [${deviceName}]`);

            page = await context.newPage();

            await page.goto(url, { timeout: 45000, waitUntil: 'load' });

            await page.evaluate(getJsCleanup());

            const buffer = await page.screenshot({
                type: 'jpeg',
                quality: JPEG_QUALITY
            });

            console.log(`[${new Date().toISOString()}] Sending ${url} [${deviceName}] to API`);

            uploadScreenshot(buffer, {
                url_id,
                objectKey,
                deviceName,
                capturedAt,
                status: 'ok'
            }).then(() => {
                console.log(`[${new Date().toISOString()}] Upload successful for ${objectKey}`);
            }).catch((err) => {
                console.error(`Failed background upload for ${objectKey}:`, err);
            });

        } catch (error) {
            console.error(`Error for ${url} [${deviceName}]:`, error);

            try {
                console.log(`[${new Date().toISOString()}] Reporting failure for ${url} [${deviceName}]`);

                uploadScreenshot(null, {
                    url_id,
                    objectKey: null,
                    deviceName,
                    capturedAt,
                    status: 'failed'
                }).catch((err) => {
                    console.error(`CRITICAL: Failed to report failure for ${url} [${deviceName}]:`, err);
                });

            } catch (uploadError) {
                console.error(`CRITICAL: Failed to initiate failure report for ${url} [${deviceName}]:`, uploadError);
            }

        } finally {
            if (page) {
                await page.close().catch(() => { });
            }
        }
    });

    await Promise.all(devicePromises);
}