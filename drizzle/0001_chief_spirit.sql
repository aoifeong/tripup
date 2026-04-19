CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`duration` integer NOT NULL,
	`category` text NOT NULL
);
