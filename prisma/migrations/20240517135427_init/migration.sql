-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_facilityId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "facilityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
