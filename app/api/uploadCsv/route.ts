import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const maxDuration = 60;

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { data, info } = await req.json();

        if (!info.type || !info.universityId || !info.facilityId) {
            throw new Error('Missing required fields (info)');
        }
        const { type, universityId, facilityId } = info;

        let university = await prisma.university.findUnique({
            where: { id: universityId },
        });
        let facility = await prisma.facility.findUnique({
            where: { id: facilityId }
        })
        if (!university || !facility) {
            throw new Error('unknown university and/or facility');
        }

        console.log(university.id, facility.id);

        const reservations = [];
        for (const row of data) {
            if (!row.title || !row.room || !row.startTime || !row.endTime) {
                console.log('Skip row: Missing required fields');
                continue;
            }

            const startTime = new Date(row.startTime);
            const endTime = new Date(row.endTime);


            let room = await prisma.room.findFirst({
                where: {
                    universityId: university.id,
                    facilityId: facility.id,
                    name: row.room.trim()
                },
            });
            if (!room) {
                room = await prisma.room.create({
                    data: {
                        universityId: university.id,
                        facilityId: facility.id,
                        floor: 'other',
                        name: row.room.trim(),
                        valid: 'VIEW',
                    },
                });
            }

            // Create reservation
            reservations.push({
                title: row.title || 'unknow',
                group: row.type,
                type: info.type,
                roomId: room.id,
                startTime,
                endTime,
                // status: 'CONFIRMED',
                description: row.description || null,
                userId: row.user || null,
            });
        }

        let createdReservations;
        if (info.type == 'COURSE') {
            createdReservations = await prisma.resv.createMany({
                data: reservations,
            });
        } else if (info.type == 'FORCE') {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                today.setMinutes(today.getMinutes() - (9 * 60));

                const rooms = await prisma.room.findMany({
                    where: { facilityId: facility.id },
                    select: { id: true },
                });
                const roomIds = rooms.map(room => room.id);

                await prisma.resv.deleteMany({
                    where: {
                        roomId: { in: roomIds },
                        type: 'FORCE',
                        startTime: {
                            gt: today,
                        },
                    },
                });

                createdReservations = await prisma.resv.createMany({
                    data: reservations,
                });
            } catch (err: any) {
                console.log(err);
                throw new Error('cannot clear or add to db', err)
            }
        } else { throw new Error('unknown db'); }

        return NextResponse.json({ ok: true, createdReservations }, { status: 201 });
    } catch (err) {
        console.error('Error creating reservations:', err);
        return NextResponse.json({ ok: false, error: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
