import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params
        const body = await request.json()
        const delete_pin = body.delete_pin
        
        if (!delete_pin) {
            return NextResponse.json({ error: "Delete pin is required" }, { status: 400 })
        }

        const database = await neon(process.env.DATABASE_URL as string)

        const rooms = await database`
            SELECT id FROM rooms 
            WHERE id = ${roomId} AND delete_pin = ${String(delete_pin).trim()}
        `;

        if (!rooms || rooms.length === 0) {
            return NextResponse.json(
                { error: "Room not found or incorrect delete pin" },
                { status: 404 }
            )
        }

        await database`DELETE FROM rooms WHERE id = ${roomId}`;

        return NextResponse.json(
            { message: "Room deleted successfully" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        )
    }
}