import type { BrowserContext } from "playwright";
import { chromium } from "playwright";

import { BROWSER_ARGS } from "./config/browser-args";
import { VIEWPORTS } from "./config/viewports";
import { processSingleUrl } from "./core/processor";
import { reportRunMetadata } from "./services/reportRun";
import { requestUrls } from "./services/requestUrls";
import { generateTimestampKey } from "./utils/generateTimestampKey";

async function takeScreenshots() {
    const start = new Date();
    console.log(`[${start.toISOString()}] Starting Batch Screenshot Job`);

    const urls = await requestUrls();

    if (!urls.length) {
        console.log("No URLs received from API.");
        return;
    }

    console.log(`Loaded ${urls.length} URLs to process.`);
    const tsIsoFileName = generateTimestampKey();

    const browser = await chromium.launch({
        headless: true,
        args: BROWSER_ARGS
    });

    const contextsByDevice: Record<string, BrowserContext> = {};
    const deviceNames = Object.keys(VIEWPORTS);
    const totalExpectedScreenshots = urls.length * deviceNames.length;

    let successfulUrls = 0;
    let failedUrls = 0;
    let completedScreenshots = 0;
    let failedScreenshots = 0;

    try {
        console.log("Initializing browser contexts...");

        for (const [deviceName, deviceConfig] of Object.entries(VIEWPORTS)) {
            contextsByDevice[deviceName] = await browser.newContext({
                ...deviceConfig,
                ignoreHTTPSErrors: true,
            });
        }

        for (const [index, urlData] of urls.entries()) {
            console.log(`Processing ${index + 1}/${urls.length}: ${urlData.url}`);

            try {
                const result = await processSingleUrl(contextsByDevice, urlData, tsIsoFileName);

                completedScreenshots += result.success ?? 0;
                failedScreenshots += result.failed ?? 0;

                successfulUrls++;
            } catch (error) {
                console.error(`Unexpected crash processing ${urlData.url}:`, error);

                failedUrls++;
                failedScreenshots += deviceNames.length;
            }
        }

    } catch (err) {
        console.error("Critical Batch Error:", err);
    } finally {
        console.log("Closing contexts and browser...");

        for (const context of Object.values(contextsByDevice)) {
            try {
                await context.close();
            } catch (closeError) {
                console.error("Failed closing context:", closeError);
            }
        }

        try {
            await browser.close();
        } catch (browserCloseError) {
            console.error("Failed closing browser:", browserCloseError);
        }
    }

    const end = new Date();
    const durationSeconds = (end.getTime() - start.getTime()) / 1000;

    console.log(`[${end.toISOString()}] Batch Job Finished in ${durationSeconds}s`);

    await reportRunMetadata({
        failed_screenshots: failedScreenshots,
        successful_urls: successfulUrls,
        total_urls: urls.length,
        total_screenshots: totalExpectedScreenshots,
        completed_screenshots: completedScreenshots,
        failed_urls: failedUrls,
        duration_seconds: durationSeconds,
        started_at: start.toISOString(),
        completed_at: end.toISOString(),
    });
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