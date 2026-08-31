CREATE TABLE `answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text NOT NULL,
	`player_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer` text NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_answers_room_question` ON `answers` (`room_id`,`question_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_answers_player_question` ON `answers` (`player_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`name` text NOT NULL,
	`player_token` text NOT NULL,
	`seat` integer NOT NULL,
	`joined_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_players_room` ON `players` (`room_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_token` ON `players` (`player_token`);--> statement-breakpoint
CREATE TABLE `room_files` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`r2_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_room_files_room` ON `room_files` (`room_id`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`context` text DEFAULT '' NOT NULL,
	`player_count` integer DEFAULT 2 NOT NULL,
	`timer_minutes` integer DEFAULT 5 NOT NULL,
	`meme_enabled` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`current_question_index` integer DEFAULT 0 NOT NULL,
	`questions_json` text DEFAULT '[]' NOT NULL,
	`comparison_json` text DEFAULT '[]' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`meme_text` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rooms_status_updated` ON `rooms` (`status`,`updated_at`);