CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`created_at` integer,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `baby_members` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `baby_members_baby_user_unique` ON `baby_members` (`baby_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `baby_members_baby_id_idx` ON `baby_members` (`baby_id`);
--> statement-breakpoint
CREATE INDEX `baby_members_user_id_idx` ON `baby_members` (`user_id`);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`baby_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text NOT NULL,
	`invited_by` text NOT NULL,
	`created_at` integer,
	`accepted_at` integer,
	FOREIGN KEY (`baby_id`) REFERENCES `babies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_token_hash_unique` ON `invitations` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `invitations_baby_id_idx` ON `invitations` (`baby_id`);
--> statement-breakpoint
CREATE INDEX `invitations_email_idx` ON `invitations` (`email`);
