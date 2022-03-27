/*
  Warnings:

  - You are about to alter the column `expire` on the `basic_auth` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `basic_auth` MODIFY `expire` INTEGER NOT NULL;
