'use server'
import nodemailer from "nodemailer";
// import { getUrl } from "@/utils/getUrl";

export const sendEmail = async (
  senderName: string,
  emails: string[],
  subject: string,
  text: string,
  html?: string
): Promise<{ ok: boolean; message?: string }> => {
  const mail = process.env.MAIL_ACCOUNT;
  const pass = process.env.MAIL_PASSWORD;

  if (!mail || !pass) {
    console.error("Missing email credentials");
    return { ok: false, message: "Missing email credentials." };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: mail,
      pass: pass,
    },
  });

  const emailStr = emails.join(", ");

  try {
    let message = {};
    if (html) {
      message = {
        from: `${senderName} <${mail}>`,
        bcc: emailStr,
        subject,
        text,
        html,
      };
    } else {
      message = {
        from: `${senderName} <${mail}>`,
        bcc: emailStr,
        subject,
        text,
      };
    }

    const info = await transporter.sendMail(message);
    console.log("Message sent:", info);

    return { ok: true };
  } catch (error) {
    console.error("Failed to send email: ", error);
    return { ok: false, message: "Unknown Error." };
  }
};

// export const sendEmailWithMemberId = async (
//   senderId: number,
//   receiverId: number,
//   subject: string,
//   text: string,
//   html?: string
// ): Promise<{ ok: boolean; message?: string }> => {

//   const senderUser = await prisma.userAccess.findUnique({
//     where: {
//       member_id: senderId,
//     },
//     include: {
//       member: true,
//     },
//   });
//   console.log(senderUser);

//   if (!senderUser || !senderUser.member) return { ok: false, message: "Sender user or member not found." };
//   if (senderUser?.role !== "ADMIN" && senderUser?.role !== "MODERATOR") {
//     return { ok: false, message: "Sender not authorized." };
//   }
//   const senderMember = senderUser.member;

//   const receiverUser = await prisma.userAccess.findUnique({
//     where: {
//       member_id: receiverId,
//     },
//     include: {
//       member: true,
//     },
//   });

//   if (!receiverUser || !receiverUser.member) return { ok: false, message: "Receiver user or member not found." };
//   const receiverMember = receiverUser.member;

//   const emailResult = await prisma.emails.create({
//     data: {
//       sender_id: senderUser.member_id,
//       receiver_id: receiverUser.member_id,
//       reciever_email: receiverUser.email,
//       subject: subject,
//       content: text,
//     },
//   });

//   const receiverName = `${receiverMember.familyName} ${receiverMember.middleName ? `${receiverMember.middleName} ` : ""
//     }${receiverMember.givenName}`;
//   const formattedBody = `
//     You have a message from GSU Council.
//     GSU運営委員よりメッセージが届いています。

//     ーーーーーーーーーーーーーーーーーーーーー
//     To: ${receiverName} (Member Id: M${receiverMember.member_id})
//     Subject: ${subject}

//     ${text}
//     ーーーーーーーーーーーーーーーーーーーーー
//     Email Id: E${emailResult.email_id.toString().padStart(6, "0")}

//     ※本メールは送信専用のため、ご返信いただけません。
//     ※宛先が異なるなど、ご不明な点はヘルプデスクまでご連絡ください。
//     ※If this was not for you please contact us.

//     ━━━━━━━━━━━━━━━━
//     Send by GLOMAC Student Union Council
//     [Help Desk]
//     ${getUrl()}support

//     このメールの再配信および掲載記事の無断転載は禁止
//     Copyright(C) All rights reserved.
//       `;

//   const senderName = `[Student Union] from "${senderMember.familyName} ${senderMember.givenName}"`;
//   let result: any;
//   if (html) {
//     result = await sendEmail(
//       senderName,
//       [receiverUser.email],
//       subject,
//       text,
//       html
//     );
//   } else {
//     result = await sendEmail(
//       senderName,
//       [receiverUser.email],
//       subject,
//       text,
//     );
//   }
//   console.log(result);
//   if (!result.ok) return { ok: false, message: "Unkwon Error" };

//   return { ok: true };
// };
