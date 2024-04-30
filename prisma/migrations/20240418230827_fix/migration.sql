/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Likes` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `authorFid` on the `Likes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Likes" DROP COLUMN "authorFid",
ADD COLUMN     "authorFid" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userId_key" ON "Likes"("userId");
