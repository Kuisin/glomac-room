/*
  Warnings:

  - You are about to drop the column `area` on the `Facility` table. All the data in the column will be lost.
  - The `status` column on the `Resv` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `facilityId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ResvStatus" AS ENUM ('PRE_REQUEST', 'PENDING', 'CONFIRMED', 'CANCELLED', 'UPDATED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_facilityId_fkey";

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "area",
ADD COLUMN     "areaId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Resv" ALTER COLUMN "title" SET DEFAULT 'unknown',
ALTER COLUMN "type" SET DEFAULT 'User',
DROP COLUMN "status",
ADD COLUMN     "status" "ResvStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "facilityId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "universityId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "valid" SET DEFAULT false;

-- CreateTable
CREATE TABLE "ResvForce" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ResvStatus" NOT NULL DEFAULT 'CONFIRMED',
    "title" TEXT NOT NULL DEFAULT 'unknown',
    "type" TEXT NOT NULL DEFAULT 'Office',
    "roomId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "userId" INTEGER,

    CONSTRAINT "ResvForce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResvCourse" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ResvStatus" NOT NULL DEFAULT 'CONFIRMED',
    "title" TEXT NOT NULL DEFAULT 'unknown',
    "type" TEXT NOT NULL DEFAULT 'Course',
    "roomId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "userId" INTEGER,

    CONSTRAINT "ResvCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "universtiyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResvForce_roomId_idx" ON "ResvForce"("roomId");

-- CreateIndex
CREATE INDEX "ResvForce_userId_idx" ON "ResvForce"("userId");

-- CreateIndex
CREATE INDEX "ResvForce_startTime_idx" ON "ResvForce"("startTime");

-- CreateIndex
CREATE INDEX "ResvForce_endTime_idx" ON "ResvForce"("endTime");

-- CreateIndex
CREATE INDEX "ResvCourse_roomId_idx" ON "ResvCourse"("roomId");

-- CreateIndex
CREATE INDEX "ResvCourse_userId_idx" ON "ResvCourse"("userId");

-- CreateIndex
CREATE INDEX "ResvCourse_startTime_idx" ON "ResvCourse"("startTime");

-- CreateIndex
CREATE INDEX "ResvCourse_endTime_idx" ON "ResvCourse"("endTime");

-- CreateIndex
CREATE INDEX "Area_universtiyId_idx" ON "Area"("universtiyId");

-- CreateIndex
CREATE INDEX "Facility_areaId_idx" ON "Facility"("areaId");

-- CreateIndex
CREATE INDEX "Resv_endTime_idx" ON "Resv"("endTime");

-- AddForeignKey
ALTER TABLE "ResvForce" ADD CONSTRAINT "ResvForce_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResvForce" ADD CONSTRAINT "ResvForce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResvCourse" ADD CONSTRAINT "ResvCourse_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResvCourse" ADD CONSTRAINT "ResvCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_universtiyId_fkey" FOREIGN KEY ("universtiyId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
