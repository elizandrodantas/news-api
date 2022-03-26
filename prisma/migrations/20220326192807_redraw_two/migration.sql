/*
  Warnings:

  - You are about to drop the column `OAuth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `secretId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `OAuth`,
    DROP COLUMN `clientId`,
    DROP COLUMN `secretId`;
