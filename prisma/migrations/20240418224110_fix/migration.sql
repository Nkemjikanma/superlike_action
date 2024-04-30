/*
  Warnings:

  - The primary key for the `Likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `castid` on the `Likes` table. All the data in the column will be lost.
  - You are about to drop the column `dailyCount` on the `User` table. All the data in the column will be lost.
  - Added the required column `castId` to the `Likes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_pkey",
DROP COLUMN "castid",
ADD COLUMN     "castId" TEXT NOT NULL,
ADD CONSTRAINT "Likes_pkey" PRIMARY KEY ("castId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dailyCount";
