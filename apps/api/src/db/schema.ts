import { sqliteTable, text, index, integer } from 'drizzle-orm/sqlite-core'

export const urlsTable = sqliteTable('urls_table', {
    id: text('id').primaryKey().notNull(),
    url: text('url').notNull(),
    language: text('language').notNull(),
})

export const screenshotsTable = sqliteTable('screenshots_table', {
    id: text('id').primaryKey().notNull(),
    url_id: text('url_id').notNull().references(() => urlsTable.id, { onDelete: 'cascade' }),
    device: text('device', { enum: ['desktop', 'mobile'] }).notNull(),
    job_status: text('job_status', { enum: ['ok', 'failed'] }).notNull(),
    r2_key: text('r2_key').unique(),
    created_at: text('created_at').notNull(),
}, (t) => [
    index('url_id_idx').on(t.url_id),
    index('status_idx').on(t.job_status),
    index('created_at_idx').on(t.created_at)
])

export const runsTable = sqliteTable('runs_table', {
    id: text('id').primaryKey().notNull(),
    total_screenshots: integer('total_screenshots').notNull(),
    completed_screenshots: integer('completed_screenshots').notNull(),
    failed_screenshots: integer('failed_screenshots').notNull(),
    total_urls: integer('total_urls').notNull(),
    started_at: text('started_at').notNull(),
    completed_at: text('completed_at').notNull(),
})