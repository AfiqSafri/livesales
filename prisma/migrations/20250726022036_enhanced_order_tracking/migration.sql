/*
  Warnings:

  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `actualDelivery` DATETIME(3) NULL,
    ADD COLUMN `buyerNotes` VARCHAR(191) NULL,
    ADD COLUMN `courierName` VARCHAR(191) NULL,
    ADD COLUMN `estimatedDelivery` DATETIME(3) NULL,
    ADD COLUMN `paymentDate` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `sellerNotes` VARCHAR(191) NULL,
    ADD COLUMN `shippingCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `shippingMethod` VARCHAR(191) NULL,
    ADD COLUMN `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` VARCHAR(191) NULL,

    INDEX `OrderStatusHistory_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourierIntegration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `apiSecret` VARCHAR(191) NULL,
    `baseUrl` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CourierIntegration_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackingEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackingNumber` VARCHAR(191) NOT NULL,
    `courierName` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `eventDescription` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TrackingEvent_trackingNumber_courierName_idx`(`trackingNumber`, `courierName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
