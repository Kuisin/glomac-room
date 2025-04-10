import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(req: Request) {
  const prisma = new PrismaClient();

  const { info } = await req.json();

  if (!info.type || !info.universityId || !info.facilityId) {
    throw new Error("Missing required fields (info)");
  }
  const { universityId, facilityId } = info;

  let university = await prisma.university.findUnique({
    where: { id: universityId },
  });
  let facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });
  if (!university || !facility) {
    throw new Error("unknown university and/or facility");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setMinutes(today.getMinutes() - 9 * 60);

  try {
    const rooms = await prisma.room.findMany({
      where: { facilityId: facility.id },
      select: { id: true },
    });
    const roomIds = rooms.map((room) => room.id);

    const result = await prisma.resv.deleteMany({
      where: {
        roomId: { in: roomIds },
        type: "COURSE",
        startTime: {
          gt: today,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err) {
    console.error("Error deleting course data:", err);
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
