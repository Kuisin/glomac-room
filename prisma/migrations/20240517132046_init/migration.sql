/*
  Warnings:

  - You are about to drop the column `room` on the `Resv` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Resv` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Resv` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resv" DROP COLUMN "room",
DROP COLUMN "user",
ADD COLUMN     "roomId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "Facility" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floors" TEXT[],
    "description" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "facilityId" INTEGER NOT NULL,
    "floor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_facilityId_idx" ON "Room"("facilityId");

-- CreateIndex
CREATE INDEX "Resv_roomId_idx" ON "Resv"("roomId");

-- CreateIndex
CREATE INDEX "Resv_userId_idx" ON "Resv"("userId");

-- CreateIndex
CREATE INDEX "Resv_startTime_idx" ON "Resv"("startTime");

-- AddForeignKey
ALTER TABLE "Resv" ADD CONSTRAINT "Resv_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resv" ADD CONSTRAINT "Resv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
