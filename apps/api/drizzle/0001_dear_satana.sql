PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_screenshots_table` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`language` text NOT NULL,
	`device` text NOT NULL,
	`job_status` text NOT NULL,
	`r2_key` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_screenshots_table`("id", "url", "language", "device", "job_status", "r2_key", "created_at") SELECT "id", "url", "language", "device", "job_status", "r2_key", "created_at" FROM `screenshots_table`;--> statement-breakpoint
DROP TABLE `screenshots_table`;--> statement-breakpoint
ALTER TABLE `__new_screenshots_table` RENAME TO `screenshots_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `screenshots_table_r2_key_unique` ON `screenshots_table` (`r2_key`);--> statement-breakpoint
CREATE INDEX `url_idx` ON `screenshots_table` (`url`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `screenshots_table` (`job_status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `screenshots_table` (`created_at`);