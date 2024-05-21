import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const main = async () => {
    try {
        await prisma.$connect();
    } catch (err) {
        return Error("DB connection failed")
    }
}

export async function GET() {
    try {
        await main();
        const resvs = await prisma.resv.findMany();
        return NextResponse.json({ success: true, resvs }, { status: 200 });
    } catch (err) {
        console.log('error: ', err)
        return NextResponse.json({ success: false, err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    try {
        let status = 'pending';
        let { title, type, room, startTime, endTime, description, userId } = await req.json();

        // Ensure that startTime and endTime are valid Date objects
        const parsedStartTime = new Date(startTime);
        const parsedEndTime = new Date(endTime);

        // Validate required fields
        if (!title || !room || !parsedStartTime || !parsedEndTime) {
            throw new Error('Missing required fields');
        }
        if (!type) type = 'unknown';

        startTime = new Date(startTime);
        endTime = new Date(endTime);

        let newRoom = await prisma.room.findFirst({
            where: { name: room },
        });

        if (!newRoom) {
            newRoom = await prisma.room.create({
                data: { facilityId: 1, name: room },
            });
        }

        const resv = await prisma.resv.create({
            data: {
                status,
                title,
                type,
                roomId: newRoom.id,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                description,
                userId,
            },
        });

        return NextResponse.json({ success: true, resv }, { status: 201 });
    } catch (err) {
        console.error('Error creating reservation:', err);
        return NextResponse.json({ success: false, err: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}