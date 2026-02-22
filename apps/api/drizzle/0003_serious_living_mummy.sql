CREATE TABLE `runs_table` (
	`id` text PRIMARY KEY NOT NULL,
	`total_screenshots` integer NOT NULL,
	`completed_screenshots` integer NOT NULL,
	`failed_screenshots` integer NOT NULL,
	`total_urls` integer NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text NOT NULL
);
