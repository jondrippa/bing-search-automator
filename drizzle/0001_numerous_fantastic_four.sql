CREATE TABLE `dailyStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`searches` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `microsoftTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp NOT NULL,
	`email` varchar(320),
	`lastRefreshed` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `microsoftTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `microsoftTokens_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`pointsAvailable` int NOT NULL DEFAULT 0,
	`pointsEarned` int DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp,
	`url` text,
	`icon` varchar(255),
	`priority` varchar(20) NOT NULL DEFAULT 'medium',
	`lastSynced` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`totalSearches` int NOT NULL DEFAULT 0,
	`dailyQuota` int NOT NULL DEFAULT 10,
	`dailySearches` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userMetrics_id` PRIMARY KEY(`id`)
);
