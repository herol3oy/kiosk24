import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const urlsTable = sqliteTable("urls_table", {
	id: text("id").primaryKey().notNull(),
	url: text("url").notNull(),
	language: text("language").notNull(),
});

export const screenshotsTable = sqliteTable(
	"screenshots_table",
	{
		id: text("id").primaryKey().notNull(),
		url_id: text("url_id")
			.notNull()
			.references(() => urlsTable.id, { onDelete: "cascade" }),
		device: text("device", { enum: ["desktop", "mobile"] }).notNull(),
		job_status: text("job_status", { enum: ["ok", "failed"] }).notNull(),
		r2_key: text("r2_key").unique(),
		created_at: text("created_at").notNull(),
	},
	(t) => [
		index("url_id_idx").on(t.url_id),
		index("status_idx").on(t.job_status),
		index("created_at_idx").on(t.created_at),
	],
);

export const runsTable = sqliteTable("runs_table", {
	id: text("id").primaryKey().notNull(),
	total_screenshots: integer("total_screenshots").notNull(),
	completed_screenshots: integer("completed_screenshots").notNull(),
	failed_screenshots: integer("failed_screenshots").notNull(),
	total_urls: integer("total_urls").notNull(),
	started_at: text("started_at").notNull(),
	completed_at: text("completed_at").notNull(),
});

export const insertUrlSchema = createInsertSchema(urlsTable).extend({
	id: z.string().optional(),
	url: z.url(),
});
export const insertScreenshotSchema = createInsertSchema(screenshotsTable);
export const insertRunSchema = createInsertSchema(runsTable);

export const selectUrlSchema = createSelectSchema(urlsTable);

export const createUrlApiSchema = insertUrlSchema.omit({ id: true });

export const createScreenshotApiSchema = insertScreenshotSchema.extend({
	id: z.string().optional(),
});

export const createRunApiSchema = insertRunSchema.omit({
	id: true,
});

export const urlParamSchema = z.object({
	id: z.string().min(1, "ID is required"),
});

export const keyParamSchema = z.object({
	key: z.string().min(1, "Image key is required"),
});

export const getScreenshotsQuerySchema = z.object({
	url: z.string().optional(),
	date: z.string().optional(),
	device: z.enum(["desktop", "mobile"]).optional(),
});

export const getAvailableDatesQuerySchema = z.object({
	url: z.string().optional(),
});

export const getLatestQuerySchema = z.object({
	device: z.enum(["desktop", "mobile"]).optional(),
});

export const uploadScreenshotSchema = z
	.object({
		url_id: z.string().min(1, "url_id is required"),
		deviceName: z.enum(["desktop", "mobile"]),
		capturedAt: z.string().min(1, "capturedAt is required"),
		jobStatus: z.enum(["ok", "failed"]).default("ok"),
		objectKey: z.string().optional(),
		image: z.instanceof(File).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.jobStatus === "ok") {
			if (!data.objectKey) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "objectKey is required for successful jobs",
					path: ["objectKey"],
				});
			}
			if (!data.image) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "No image file provided for successful job",
					path: ["image"],
				});
			}
		}
	});
