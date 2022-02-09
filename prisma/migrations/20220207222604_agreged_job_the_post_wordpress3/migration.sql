/*
  Warnings:

  - You are about to drop the column `image` on the `service_wordpress_pu` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `service_wordpress_pu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `service_wordpress_pu` DROP COLUMN `image`,
    DROP COLUMN `signature`;
