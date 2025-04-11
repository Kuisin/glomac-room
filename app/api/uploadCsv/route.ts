import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/utils/sendEmail";
export const maxDuration = 60;

const prisma = new PrismaClient();

// Helper function to convert date to Japan timezone
function toJapanTime(date: Date): Date {
  const japanOffset = 9 * 60 * 60 * 1000; // UTC+9 in milliseconds
  return new Date(date.getTime() + japanOffset);
}

export async function POST(req: Request) {
  try {
    const { data, info } = await req.json();

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

    // console.log(university.id, facility.id, data[0]);

    const reservations = [];
    for (const row of data) {
      if (!row.title || !row.room || !row.startTime || !row.endTime) {
        console.log("Skip row: Missing required fields");
        continue;
      }

      // Convert timestamps to Japan timezone
      // console.log(row);
      const startTime = new Date(row.startTime);
      const endTime = new Date(row.endTime);

      let room = await prisma.room.findFirst({
        where: {
          universityId: university.id,
          facilityId: facility.id,
          name: row.room.trim(),
        },
      });
      if (!room) {
        room = await prisma.room.create({
          data: {
            universityId: university.id,
            facilityId: facility.id,
            floor: "other",
            name: row.room.trim(),
            valid: "VIEW",
          },
        });
      }

      // Create reservation
      reservations.push({
        title: row.title || "unknow",
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
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - 9 * 60);

      if (info.type === "FORCE") {
        const rooms = await prisma.room.findMany({
          where: { facilityId: facility.id },
          select: { id: true },
        });
        const roomIds = rooms.map((room) => room.id);

        await prisma.resv.deleteMany({
          where: {
            roomId: { in: roomIds },
            type: "FORCE",
            startTime: {
              gt: today,
            },
          },
        });
      } else if (info.type === "COURSE") {
        const emailSubject = "New Course Reservations Added";
        const emailText = `New course reservations have been added to the system.`;
        
        // Format reservations for the email
        const reservationsTable = reservations.map(res => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${res.title}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${res.roomId}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(res.startTime).toLocaleString('ja-JP')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(res.endTime).toLocaleString('ja-JP')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${res.group || 'N/A'}</td>
          </tr>
        `).join('');

        const emailHtml = `
          <h2>New Course Reservations Added</h2>
          <p>New course reservations have been added to the system with the following details:</p>
          <ul>
            <li>Number of reservations: ${reservations.length}</li>
            <li>University: ${university.name}</li>
            <li>Facility: ${facility.name}</li>
          </ul>
          
          <h3>Reservation Details:</h3>
          <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Title</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Room</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Start Time</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">End Time</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Group</th>
              </tr>
            </thead>
            <tbody>
              ${reservationsTable}
            </tbody>
          </table>
          
          <p style="margin-top: 20px;">Please review the reservations in the admin panel.</p>
        `;
        
        await sendEmail(
          "Reservation System",
          ["a22.y7ff@g.chuo-u.ac.jp"],
          emailSubject,
          emailText,
          emailHtml
        );
      } else {
        throw new Error("unknown type");
      }

      createdReservations = await prisma.resv.createMany({
        data: reservations,
      });
      // console.log("reservations", reservations);
    } catch (err: any) {
      console.log(err);
      throw new Error("cannot clear or add to db", err);
    }

    return NextResponse.json(
      { ok: true, createdReservations },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating reservations:", err);
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
