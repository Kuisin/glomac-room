-- CreateEnum
CREATE TYPE "ResvStatus" AS ENUM ('PRE_REQUEST', 'PENDING', 'CONFIRMED', 'CANCELLED', 'UPDATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ResvType" AS ENUM ('COURSE', 'FORCE', 'USER');

-- CreateEnum
CREATE TYPE "RoomValid" AS ENUM ('DISABLE', 'VIEW', 'ALLOW');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'OFFICE', 'ADMIN');

-- CreateTable
CREATE TABLE "Resv" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL DEFAULT 'unknown',
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,
    "description" TEXT,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER,
    "status" "ResvStatus" NOT NULL DEFAULT 'PENDING',
    "group" TEXT DEFAULT 'none',
    "type" "ResvType" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Resv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floors" TEXT[],
    "description" TEXT,
    "areaId" INTEGER,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "facilityId" INTEGER NOT NULL,
    "floor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "location" TEXT,
    "description" TEXT,
    "valid" "RoomValid" NOT NULL DEFAULT 'DISABLE',
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "studentId" TEXT,
    "email" TEXT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT false,
    "showProfile" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserUniversity" (
    "userId" INTEGER NOT NULL,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "UserUniversity_pkey" PRIMARY KEY ("userId","universityId")
);

-- CreateIndex
CREATE INDEX "Resv_roomId_idx" ON "Resv"("roomId");

-- CreateIndex
CREATE INDEX "Resv_userId_idx" ON "Resv"("userId");

-- CreateIndex
CREATE INDEX "Resv_startTime_idx" ON "Resv"("startTime");

-- CreateIndex
CREATE INDEX "Resv_endTime_idx" ON "Resv"("endTime");

-- CreateIndex
CREATE INDEX "Area_universityId_idx" ON "Area"("universityId");

-- CreateIndex
CREATE INDEX "Facility_universityId_idx" ON "Facility"("universityId");

-- CreateIndex
CREATE INDEX "Facility_areaId_idx" ON "Facility"("areaId");

-- CreateIndex
CREATE INDEX "Room_universityId_idx" ON "Room"("universityId");

-- CreateIndex
CREATE INDEX "Room_facilityId_idx" ON "Room"("facilityId");

-- AddForeignKey
ALTER TABLE "Resv" ADD CONSTRAINT "Resv_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resv" ADD CONSTRAINT "Resv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUniversity" ADD CONSTRAINT "UserUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUniversity" ADD CONSTRAINT "UserUniversity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

