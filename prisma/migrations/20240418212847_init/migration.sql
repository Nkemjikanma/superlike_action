-- CreateTable
CREATE TABLE "User" (
    "fid" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("fid")
);

-- CreateTable
CREATE TABLE "Likes" (
    "castid" TEXT NOT NULL,
    "authorFid" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("castid")
);

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;
