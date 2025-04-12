import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const records = await prisma.resv.findMany({
      where: {
        type: "FORCE",
      },
      include: {
        room: true,
        user: true,
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching force records:", error);
    return NextResponse.json(
      { error: "Failed to fetch force records" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.startTime || !body.endTime || !body.roomId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRecord = await prisma.resv.create({
      data: {
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        description: body.description || null,
        roomId: parseInt(body.roomId, 10),
        type: "FORCE",
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating force record:", error);
    return NextResponse.json(
      { error: "Failed to create force record" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 