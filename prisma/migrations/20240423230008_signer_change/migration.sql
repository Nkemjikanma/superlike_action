/*
  Warnings:

  - A unique constraint covering the columns `[fid]` on the table `signer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "signer_fid_key" ON "signer"("fid");
