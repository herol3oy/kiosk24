DROP INDEX `url_idx`;--> statement-breakpoint
ALTER TABLE `screenshots_table` ADD `url_id` text NOT NULL REFERENCES urls_table(id);--> statement-breakpoint
CREATE INDEX `url_id_idx` ON `screenshots_table` (`url_id`);--> statement-breakpoint
ALTER TABLE `screenshots_table` DROP COLUMN `url`;--> statement-breakpoint
ALTER TABLE `screenshots_table` DROP COLUMN `language`;