/*
  Warnings:

  - Added the required column `universtiyId` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `universityId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_areaId_fkey";

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "universityId" INTEGER,
ADD COLUMN     "universtiyId" INTEGER NOT NULL,
ALTER COLUMN "areaId" DROP NOT NULL,
ALTER COLUMN "areaId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "universityId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "University" ALTER COLUMN "ownerId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Facility_universtiyId_idx" ON "Facility"("universtiyId");

-- CreateIndex
CREATE INDEX "Room_universityId_idx" ON "Room"("universityId");

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
