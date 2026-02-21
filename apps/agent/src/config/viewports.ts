import { devices } from "playwright";

const desktop = devices["Desktop Chrome"];

export const VIEWPORTS = {
    desktop: {
        ...desktop,
        viewport: {
            ...desktop.viewport,
            height: 1080,
        },
    },
    mobile: devices["iPhone 13"],
};