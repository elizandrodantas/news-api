/*
  Warnings:

  - You are about to drop the column `username` on the `device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `device` DROP COLUMN `username`,
    MODIFY `cert_dn` LONGTEXT NULL,
    MODIFY `signed_cert_base64` LONGTEXT NULL,
    MODIFY `csr_base64` LONGTEXT NULL;
