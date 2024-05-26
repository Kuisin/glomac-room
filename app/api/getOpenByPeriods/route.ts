import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import moment from 'moment-timezone';

const prisma = new PrismaClient();

interface PeriodTime {
    name: string;
    startTime: string;
    endTime: string;
}

type AvailabilityRoom = {
    [key: string]: {
        [key: string]: {
            roomId: number;
            open: boolean;
            reservationIds: number[];
        }
    };
};

type AvailabilityFac = {
    [key: string]: {
        [key: string]: AvailabilityRoom;
    }
}

const days = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN',
];

const periodTimes: PeriodTime[] = [
    {
        name: 'P1',
        startTime: '09:00',
        endTime: '10:40',
    },
    {
        name: 'P2',
        startTime: '10:50',
        endTime: '12:30',
    },
    {
        name: 'LUNCH',
        startTime: '12:30',
        endTime: '13:20',
    },
    {
        name: 'P3',
        startTime: '13:20',
        endTime: '15:00',
    },
    {
        name: 'P4',
        startTime: '15:10',
        endTime: '16:50',
    },
    {
        name: 'P5',
        startTime: '17:00',
        endTime: '18:40',
    },
    {
        name: 'P6',
        startTime: '18:50',
        endTime: '20:30',
    },
    {
        name: 'EVENING',
        startTime: '20:30',
        endTime: '22:30',
    },
]

const fetchRoomByFacility = async (facilityId: number) => {
    const rooms = await prisma.room.findMany({
        where: {
            facilityId,
            NOT: {
                valid: 'DISABLE',
            },
        },
        select: { id: true, floor: true, name: true },
    });
    return rooms;
}

const fetchResvByRoom = async (facilityId: number) => {
    // console.log(todayStr);
    const now = new Date();
    console.log(now);
    let today = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Tokyo'}));
    today.setHours(0,0,0,0);
    console.log(today);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const rooms = await fetchRoomByFacility(facilityId);

    const availabilityAll: AvailabilityFac = {};
    let reservations = await prisma.resv.findMany({
        where: {
            startTime: {
                gte: today,
                lt: nextWeek,
            },
        },
        select: {
            id: true,
            roomId: true,
            startTime: true,
            endTime: true,
        },
    });


    let availability: AvailabilityRoom = {};
    try {
        days.map((_, dIndex: number) => {
            periodTimes.map((period, pIndex: number) => {
                availability = {};
                const { startTime, endTime } = period;
                const date = new Date(today)
                date.setDate(today.getDate() + dIndex)
                const dateStr = format(date, 'yyy-MM-dd')

                const periodStart = moment.tz(dateStr + ' ' + startTime, 'YYYY-MM-DD HH:mm', 'Asia/Tokyo').toDate();
                const periodEnd = moment.tz(dateStr + ' ' + endTime, 'YYYY-MM-DD HH:mm', 'Asia/Tokyo').toDate();
                // console.log(periodStart, periodEnd);

                rooms.map((room) => {
                    const isAvailable = reservations.filter(resv => {
                        const resvStart = new Date(resv.startTime);
                        const resvEnd = new Date(resv.endTime);

                        const used = resv.roomId == room.id && (
                            (resvStart <= periodStart && resvEnd >= periodEnd) ||
                            (resvStart >= periodStart && resvEnd <= periodEnd) ||
                            (resvStart <= periodStart && resvEnd > periodStart) ||
                            (resvStart < periodEnd && resvEnd >= periodEnd)
                        )

                        // console.log(resv.id, periodStart, periodEnd, resvStart, resvEnd, used);
                        return used;
                    });
                    // console.log(isAvailable);

                    if (!availability[room.floor]) {
                        availability[room.floor] = {}
                    }
                    availability[room.floor][room.name] = {
                        roomId: room.id,
                        open: isAvailable.length == 0,
                        reservationIds: isAvailable.map(resv => resv.id) || [],
                    };
                });
                // console.log(periodStart, periodEnd, availability['6']['F601']);


                if (!availabilityAll[dateStr]) {
                    availabilityAll[dateStr] = {};
                }
                availabilityAll[dateStr][pIndex] = availability;
                // console.log(availabilityAll[0][0]);
            });
        });
    } catch (err: any) {
        console.log(err);
        throw new Error('error with summarizing availability', err);
    }

    // console.log(availabilityAll);
    return { availabilityAll, rooms };
}



export async function POST(req: Request) {
    try {
        const data: any = await req.json();
        const { facilityId } = data;

        const { availabilityAll, rooms } = await fetchResvByRoom(facilityId);

        return NextResponse.json({ ok: true, availabilityAll, rooms }, { status: 200 });
    } catch (err) {
        console.error('Error fetching room availability:', err);
        return NextResponse.json({ ok: false, message: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function GET(req: NextRequest) {
    try {
        // const data: any = await req.json();
        // const { todayStr, facilityId } = data;
        const facilityId = parseInt(req.nextUrl.searchParams.get("facilityId") || '0', 10);
        if (facilityId == 0) return NextResponse.json({ ok: false, message: 'cannot find facility' }, { status: 500 });

        const { availabilityAll, rooms } = await fetchResvByRoom(facilityId);
        return NextResponse.json({ ok: true, availabilityAll, rooms }, { status: 200 });
    } catch (err) {
        console.error('Error fetching room availability:', err);
        return NextResponse.json({ ok: false, message: err }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}