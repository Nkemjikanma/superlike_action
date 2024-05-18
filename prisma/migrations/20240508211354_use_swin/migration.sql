/*
  Warnings:

  - You are about to drop the column `public_key` on the `signer` table. All the data in the column will be lost.
  - You are about to drop the column `signer_approval_url` on the `signer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `signer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "signer_public_key_key";

-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "alreadyTipped" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "signer" DROP COLUMN "public_key",
DROP COLUMN "signer_approval_url",
DROP COLUMN "status";
