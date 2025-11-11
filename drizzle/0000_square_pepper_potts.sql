CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('equipment_failure','overload','voltage_violation','maintenance_due','prediction_anomaly','system_warning') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`status` enum('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demandPredictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`predictionTimestamp` timestamp NOT NULL,
	`predictedDemand` int NOT NULL,
	`confidenceLower` int,
	`confidenceUpper` int,
	`modelName` varchar(100),
	`modelVersion` varchar(50),
	`actualDemand` int,
	`accuracy` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `demandPredictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energyDemand` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL,
	`totalDemand` int NOT NULL,
	`residentialDemand` int,
	`commercialDemand` int,
	`industrialDemand` int,
	`temperature` varchar(20),
	`dayOfWeek` int,
	`isHoliday` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `energyDemand_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`equipmentType` enum('transformer','breaker','capacitor','reactor','other') NOT NULL,
	`nodeId` int NOT NULL,
	`manufacturer` varchar(255),
	`model` varchar(255),
	`installationDate` timestamp,
	`lastMaintenanceDate` timestamp,
	`nextMaintenanceDate` timestamp,
	`status` enum('operational','degraded','failed','maintenance') NOT NULL DEFAULT 'operational',
	`healthScore` int DEFAULT 100,
	`failureProbability` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gridNodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nodeType` enum('substation','generator','load','junction') NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`voltage` int NOT NULL,
	`capacity` int NOT NULL,
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gridNodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenanceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`maintenanceType` enum('preventive','corrective','predictive','emergency') NOT NULL,
	`description` text,
	`performedBy` varchar(255),
	`cost` int,
	`downtime` int,
	`partsReplaced` text,
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenanceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nodeId` int,
	`lineId` int,
	`measurementType` enum('voltage','current','power','frequency','temperature') NOT NULL,
	`value` varchar(50) NOT NULL,
	`unit` varchar(20) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networkOptimizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`optimizationType` enum('load_balancing','loss_minimization','renewable_integration','voltage_control') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`inputParameters` text,
	`outputResults` text,
	`savingsEstimated` int,
	`executionTime` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `networkOptimizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renewableGeneration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nodeId` int NOT NULL,
	`sourceType` enum('solar','wind','hydro','biomass','geothermal') NOT NULL,
	`timestamp` timestamp NOT NULL,
	`generatedPower` int NOT NULL,
	`capacity` int NOT NULL,
	`efficiency` int,
	`weatherCondition` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `renewableGeneration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renewablePredictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nodeId` int NOT NULL,
	`sourceType` enum('solar','wind','hydro','biomass','geothermal') NOT NULL,
	`predictionTimestamp` timestamp NOT NULL,
	`predictedPower` int NOT NULL,
	`confidenceLower` int,
	`confidenceUpper` int,
	`weatherForecast` text,
	`actualPower` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `renewablePredictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transmissionLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`fromNodeId` int NOT NULL,
	`toNodeId` int NOT NULL,
	`capacity` int NOT NULL,
	`length` int NOT NULL,
	`resistance` varchar(50),
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transmissionLines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
