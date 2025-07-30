-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_buyerId_fkey`;

-- DropIndex
DROP INDEX `Order_buyerId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` MODIFY `buyerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
