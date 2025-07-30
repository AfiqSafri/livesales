-- AlterTable
ALTER TABLE `order` ADD COLUMN `billplzBillId` VARCHAR(191) NULL,
    ADD COLUMN `billplzPaid` BOOLEAN NOT NULL DEFAULT false;
