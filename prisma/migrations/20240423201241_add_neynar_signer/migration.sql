/*
  Warnings:

  - A unique constraint covering the columns `[signer_uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_key]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `public_key` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signer_uuid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "public_key" TEXT NOT NULL,
ADD COLUMN     "signer_approval_url" TEXT,
ADD COLUMN     "signer_uuid" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_signer_uuid_key" ON "User"("signer_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_public_key_key" ON "User"("public_key");
