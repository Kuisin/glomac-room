-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'OFFICE', 'ADMIN', 'OWNER');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "ownerId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "University_id_seq";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "universityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
