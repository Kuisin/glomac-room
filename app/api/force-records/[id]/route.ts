import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid record ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Update request body:", body);

    if (!body.title || !body.startTime || !body.endTime || !body.roomId) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields: {
          title: !body.title,
          startTime: !body.startTime,
          endTime: !body.endTime,
          roomId: !body.roomId
        }},
        { status: 400 }
      );
    }

    // Validate dates
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await prisma.resv.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    const updatedRecord = await prisma.resv.update({
      where: { id },
      data: {
        title: body.title,
        startTime: startTime,
        endTime: endTime,
        description: body.description || null,
        roomId: body.roomId,
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Detailed error updating force record:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update force record: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update force record" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid record ID" },
        { status: 400 }
      );
    }

    await prisma.resv.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting force record:", error);
    return NextResponse.json(
      { error: "Failed to delete force record" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 