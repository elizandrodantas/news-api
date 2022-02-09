-- AlterTable
ALTER TABLE `service_wordpress_pu` ADD COLUMN `error` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `report` VARCHAR(191) NULL;
