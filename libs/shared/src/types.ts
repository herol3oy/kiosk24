export type DeviceType = 'desktop' | 'mobile'

export type JobStatus = 'ok' | 'failed'

export type UrlEntry = {
    id: string
    url: string
    language: string
}

export type ScreenshotEntry = {
    id: string
    url_id: string
    url: string
    language: string
    device: DeviceType
    job_status: JobStatus
    r2_key: string | null
    created_at: string
}

export type RunMetadata = {
    successful_urls: number
    failed_urls: number
    duration_seconds: number
    total_screenshots: number
    completed_screenshots: number
    failed_screenshots: number
    total_urls: number
    started_at: string
    completed_at: string
}
