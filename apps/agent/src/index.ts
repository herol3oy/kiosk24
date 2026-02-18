import { chromium, BrowserContext } from 'playwright';
import { BROWSER_ARGS } from './config/browser-args';
import { VIEWPORTS } from './config/viewports';
import { fetchUrls } from './services/fetchUrls';
import { processSingleUrl } from './core/processor';
import { generateTimestampKey } from './utils/generateTimestampKey';

async function takeScreenshots() {
    const start = new Date();
    console.log(`[${start.toISOString()}] Starting Batch Screenshot Job`);

    let urls;
    try {
        urls = await fetchUrls();
    } catch (e) {
        console.error("Failed to fetch URLs from API:", e);
        return;
    }

    if (!urls || !urls.length) {
        console.log("No URLs received from API. Exiting.");
        return;
    }

    console.log(`Loaded ${urls.length} URLs to process.`);
    const tsIsoFileName = generateTimestampKey();

    const browser = await chromium.launch({
        headless: true,
        args: BROWSER_ARGS
    });

    const contextsByDevice: Record<string, BrowserContext> = {};

    try {
        console.log("Initializing browser contexts...");
        for (const [deviceName, config] of Object.entries(VIEWPORTS)) {
            contextsByDevice[deviceName] = await browser.newContext({
                userAgent: config.ua,
                viewport: { width: config.width, height: config.height },
                deviceScaleFactor: 1,
                ignoreHTTPSErrors: true,
            });
        }

        let successCount = 0;
        let failCount = 0;

        for (const [index, urlData] of urls.entries()) {
            console.log(`Processing ${index + 1}/${urls.length}: ${urlData.url}`);

            try {
                await processSingleUrl(contextsByDevice, urlData, tsIsoFileName);
                successCount++;
            } catch (e) {
                console.error(`Unexpected crash processing ${urlData.url}:`, e);
                failCount++;
            }

            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (err) {
        console.error("Critical Batch Error:", err);
    } finally {
        console.log("Closing contexts and browser...");
        for (const context of Object.values(contextsByDevice)) {
            try { await context.close(); } catch (e) { }
        }
        await browser.close();
    }

    const end = new Date();
    const duration = (end.getTime() - start.getTime()) / 1000;
    console.log(`[${end.toISOString()}] Batch Job Finished in ${duration}s`);
}

async function main() {
    try {
        await takeScreenshots();
        process.exit(0);
    } catch (error) {
        console.error("Fatal error in main process:", error);
        process.exit(1);
    }
}

main();