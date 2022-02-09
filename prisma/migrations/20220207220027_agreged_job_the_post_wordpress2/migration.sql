/*
  Warnings:

  - Added the required column `publish_status` to the `service_wordpress_pu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service_wordpress_pu` ADD COLUMN `publish_password` VARCHAR(191) NULL,
    ADD COLUMN `publish_status` VARCHAR(191) NOT NULL;
