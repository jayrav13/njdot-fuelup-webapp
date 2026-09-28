CREATE TABLE `bridges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`structure_number` text NOT NULL,
	`structure_key` text NOT NULL,
	`name` text NOT NULL,
	`owner` text,
	`route` text,
	`milepost` real,
	`county` text,
	`municipality` text,
	`source_latitude` real,
	`source_longitude` real,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bridges_structure_number_unique` ON `bridges` (`structure_number`);--> statement-breakpoint
CREATE INDEX `bridges_structure_key_idx` ON `bridges` (`structure_key`);--> statement-breakpoint
CREATE TABLE `stations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`city` text,
	`state` text DEFAULT 'NJ' NOT NULL,
	`county` text,
	`hours` text,
	`phone` text,
	`fuel` text,
	`unleaded` integer DEFAULT false NOT NULL,
	`diesel` integer DEFAULT false NOT NULL,
	`latitude` real,
	`longitude` real
);
