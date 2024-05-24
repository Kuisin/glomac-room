import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import moment from 'moment-timezone';

const prisma = new PrismaClient();

const fetchRoomByFacility = async (ids: number[]) => {
    const resvs = await prisma.resv.findMany({
        where: {
            id: { in: ids }
        },
        select: { id: true, title: true, type: true, startTime: true, endTime: true,  },
    });
    return resvs;
}

export async function POST(req: Request) {
    try {
        const data: any = await req.json();
        // console.log(data);
        const { reservationIds } = data;

        const reservations = await fetchRoomByFacility(reservationIds);
        console.log(reservations);

        return NextResponse.json({ ok: true, reservations }, { status: 200 });
    } catch (err) {
        console.error('Error fetching room availability:', err);
        return NextResponse.json({ ok: false, message: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
