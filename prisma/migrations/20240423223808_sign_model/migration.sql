/*
  Warnings:

  - You are about to drop the column `userId` on the `Likes` table. All the data in the column will be lost.
  - You are about to drop the column `public_key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signer_approval_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signer_uuid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - Added the required column `fid` to the `Likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- DropIndex
DROP INDEX "User_public_key_key";

-- DropIndex
DROP INDEX "User_signer_uuid_key";

-- AlterTable
ALTER TABLE "Likes" DROP COLUMN "userId",
ADD COLUMN     "fid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "public_key",
DROP COLUMN "signer_approval_url",
DROP COLUMN "signer_uuid",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "signer" (
    "signer_uuid" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "signer_approval_url" TEXT NOT NULL,
    "fid" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "signer_signer_uuid_key" ON "signer"("signer_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "signer_public_key_key" ON "signer"("public_key");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signer" ADD CONSTRAINT "signer_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;
