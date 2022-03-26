/*
  Warnings:

  - You are about to drop the `device` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `device`;

-- CreateTable
CREATE TABLE `basic_auth` (
    `id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `client_secret` VARCHAR(191) NOT NULL,
    `expire` INTEGER NOT NULL,
    `UserId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `basic_auth` ADD CONSTRAINT `basic_auth_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
