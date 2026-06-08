-- CreateTable
CREATE TABLE `Denuncia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `denuncianteId` INTEGER NOT NULL,
    `denunciadoId` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `descricao` LONGTEXT NULL,
    `status` ENUM('PENDENTE', 'EM_ANALISE', 'RESOLVIDA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
    `resolucao` LONGTEXT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    INDEX `Denuncia_denuncianteId_idx`(`denuncianteId`),
    INDEX `Denuncia_denunciadoId_idx`(`denunciadoId`),
    INDEX `Denuncia_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `dataAtualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Configuracao_chave_key`(`chave`),
    INDEX `Configuracao_chave_idx`(`chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_denuncianteId_fkey` FOREIGN KEY (`denuncianteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_denunciadoId_fkey` FOREIGN KEY (`denunciadoId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
