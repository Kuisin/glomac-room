import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const reservations = [];
        for (const row of data) {
            if (!row.title || !row.room || !row.startTime || !row.endTime) {
                throw new Error('Missing required fields');
            }
            if (!row.type) row.type = 'unknown';

            const startTime = new Date(row.startTime);
            const endTime = new Date(row.endTime);

            let room = await prisma.room.findFirst({
                where: { name: row.room },
            });

            if (!room) {
                room = await prisma.room.create({
                    data: { facilityId: 1, name: row.room },
                });
            }

            // Create reservation
            reservations.push({
                title: row.title,
                type: row.type,
                roomId: room.id,
                startTime,
                endTime,
                userId: row.user ? parseInt(row.user) : null,
            });
        }

        const createdReservations = await prisma.resv.createMany({
            data: reservations,
        });

        return NextResponse.json({ success: true, createdReservations }, { status: 201 });
    } catch (err) {
        console.error('Error creating reservations:', err);
        return NextResponse.json({ success: false, error: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
