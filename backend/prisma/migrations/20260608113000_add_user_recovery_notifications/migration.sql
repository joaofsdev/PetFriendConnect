ALTER TABLE `Usuario`
  ADD COLUMN `notificacoesEmail` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `notificacoesSms` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `resetSenhaTokenHash` VARCHAR(191) NULL,
  ADD COLUMN `resetSenhaExpiraEm` DATETIME(3) NULL;

CREATE UNIQUE INDEX `Usuario_resetSenhaTokenHash_key` ON `Usuario`(`resetSenhaTokenHash`);
CREATE INDEX `Usuario_resetSenhaExpiraEm_idx` ON `Usuario`(`resetSenhaExpiraEm`);

ALTER TABLE `Pet` MODIFY `idade` INTEGER NULL;
