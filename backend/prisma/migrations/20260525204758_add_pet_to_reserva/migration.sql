/*
  Warnings:

  - Added the required column `petId` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reserva` ADD COLUMN `petId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Reserva_petId_idx` ON `Reserva`(`petId`);

-- AddForeignKey
ALTER TABLE `Reserva` ADD CONSTRAINT `Reserva_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
