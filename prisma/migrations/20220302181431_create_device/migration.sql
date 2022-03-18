-- CreateTable
CREATE TABLE `Device` (
    `id` VARCHAR(191) NOT NULL,
    `device_id` VARCHAR(191) NULL,
    `device_name` VARCHAR(191) NULL,
    `device_status` BOOLEAN NOT NULL DEFAULT true,
    `grance_expired` INTEGER NULL,
    `cert_dn` VARCHAR(191) NULL,
    `signed_cert_base64` VARCHAR(191) NULL,
    `csr_base64` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
