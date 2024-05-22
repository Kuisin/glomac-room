/*
  Warnings:

  - You are about to drop the column `universityId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "universityId";

-- CreateTable
CREATE TABLE "UserUniversity" (
    "userId" INTEGER NOT NULL,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "UserUniversity_pkey" PRIMARY KEY ("userId","universityId")
);

-- AddForeignKey
ALTER TABLE "UserUniversity" ADD CONSTRAINT "UserUniversity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUniversity" ADD CONSTRAINT "UserUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
