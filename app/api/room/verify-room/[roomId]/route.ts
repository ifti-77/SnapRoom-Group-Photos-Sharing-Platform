import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {
    try {
        
        const { roomId } = await params
        const body = await request.json()
        const { delete_pin } = body

        if (!delete_pin) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 })
        }

        const database = await neon(process.env.DATABASE_URL as string)

        const currentRoom = await database`
            Select id, name from rooms where id = ${roomId} and delete_pin = ${String(delete_pin).trim()}
        `;


        if (!currentRoom || currentRoom.length === 0) {
            return NextResponse.json(
                { error: "Room not found or incorrect password" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, room: currentRoom[0] }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: error || "Failed to verify password" },
            { status: 500 }
        )
    }
}