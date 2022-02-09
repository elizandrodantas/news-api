/*
  Warnings:

  - Added the required column `service_id` to the `service_wordpress_pu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service_wordpress_pu` ADD COLUMN `service_id` VARCHAR(191) NOT NULL;
