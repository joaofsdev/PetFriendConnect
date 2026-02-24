-- CreateTable
CREATE TABLE `Denuncia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autorId` INTEGER NOT NULL,
    `alvoId` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'REJEITADA') NOT NULL DEFAULT 'ABERTA',
    `parecer` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Denuncia_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_alvoId_fkey` FOREIGN KEY (`alvoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
