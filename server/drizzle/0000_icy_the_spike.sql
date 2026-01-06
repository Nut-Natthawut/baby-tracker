CREATE TABLE `babies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`birth_date` text NOT NULL,
	`gender` text NOT NULL,
	`weight` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `diaper_details` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`status` text NOT NULL,
	`poo_color` text,
	`poo_texture` text,
	`notes` text,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feeding_details` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`method` text NOT NULL,
	`bottle_content` text,
	`amount_ml` integer,
	`left_duration_seconds` integer,
	`right_duration_seconds` integer,
	`has_spit_up` integer,
	`notes` text,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`type` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pumping_details` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`amount_left_ml` integer,
	`amount_right_ml` integer,
	`amount_total_ml` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sleep_details` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`end_time` integer,
	`notes` text,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE no action
);
