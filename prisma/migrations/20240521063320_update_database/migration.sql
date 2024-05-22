/*
  Warnings:

  - You are about to drop the column `location` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `University` table. All the data in the column will be lost.
  - Made the column `universtiyId` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `areaId` on table `Facility` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Resv` required. This step will fail if there are existing NULL values in that column.
  - Made the column `facilityId` on table `Room` required. This step will fail if there are existing NULL values in that column.
  - Made the column `floor` on table `Room` required. This step will fail if there are existing NULL values in that column.
  - Made the column `universityId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "RoomValid" AS ENUM ('DISABLE', 'VIEW', 'ALLOW');

-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_universtiyId_fkey";

-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";

-- AlterTable
ALTER TABLE "Area" DROP COLUMN "location",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "universtiyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Facility" ALTER COLUMN "areaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Resv" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "valid" "RoomValid" NOT NULL DEFAULT 'DISABLE',
ALTER COLUMN "facilityId" SET NOT NULL,
ALTER COLUMN "floor" SET NOT NULL;

-- AlterTable
ALTER TABLE "University" DROP COLUMN "location",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "universityId" SET NOT NULL,
ALTER COLUMN "universityId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_universtiyId_fkey" FOREIGN KEY ("universtiyId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
