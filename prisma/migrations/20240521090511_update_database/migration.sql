/*
  Warnings:

  - The values [OWNER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'TEACHER', 'OFFICE', 'ADMIN');
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showProfile" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
