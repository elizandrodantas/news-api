/*
  Warnings:

  - Added the required column `taskId` to the `service_wordpress_pu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service_wordpress_pu` ADD COLUMN `canceled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `finish` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `taskId` VARCHAR(191) NOT NULL;
