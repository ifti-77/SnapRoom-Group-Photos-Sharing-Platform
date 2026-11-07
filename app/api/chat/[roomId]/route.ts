import { pusherServer } from "@/app/_lib/pusherServer";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";


export async function GET(request: Request, {params}: {params: Promise<{roomId: string}>}) 
{
    try{

        const { roomId } = await params
        const database = await neon(process.env.DATABASE_URL as string)
        const messages = await database`SELECT id, sender_emoji AS "senderEmoji", sender_identity AS "senderIdentity", text, created_at AS "createdAt" FROM messages WHERE room_id = ${roomId} ORDER BY created_at ASC`
        return NextResponse.json(messages, { status: 200 })

    }catch (error: any) {
    console.error("Message insert error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post message" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { senderEmoji, senderIdentity, text } = await request.json()

    if (!senderEmoji || !senderIdentity || !text?.trim()) {
      return NextResponse.json(
        { error: "Missing required message fields" },
        { status: 400 }
      )
    }

    const database = await neon(process.env.DATABASE_URL as string);

    const [newMessage] = await database`
      INSERT INTO messages (room_id, sender_emoji, sender_identity, text) 
      VALUES (${roomId}, ${senderEmoji}, ${senderIdentity}, ${text.trim()}) 
      RETURNING id, sender_emoji AS "senderEmoji", sender_identity AS "senderIdentity", text, created_at AS "createdAt"`;

    await pusherServer.trigger(`room-${roomId}`, "message:posted", {
      message: "New message posted",
      newMessage,
    })

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Message insert error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post message" },
      { status: 500 }
    )
  }
}