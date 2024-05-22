-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_universtiyId_fkey";

-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";

-- AlterTable
ALTER TABLE "Area" ALTER COLUMN "universtiyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Facility" ALTER COLUMN "areaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "facilityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "universityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_universtiyId_fkey" FOREIGN KEY ("universtiyId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
