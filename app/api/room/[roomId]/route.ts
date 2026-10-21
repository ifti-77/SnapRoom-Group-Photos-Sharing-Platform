import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params
        const database = neon(process.env.DATABASE_URL as string)
        const room = await database`SELECT * FROM rooms WHERE id = ${roomId}`
        if (room.length === 0) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }
        return NextResponse.json(room[0])
    } catch (error) {
        console.error("Error fetching room:", error)
        return NextResponse.json(
            { error: "Failed to fetch room" },
            { status: 500 }
        )
    }
}

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

        const database = neon(process.env.DATABASE_URL as string)

        const rooms = await database`
            SELECT id FROM rooms 
            WHERE id = ${roomId} AND delete_pin = ${String(delete_pin).trim()}
        `;

        if (!rooms || rooms.length === 0) {
            return NextResponse.json(
                { error: "Room not found or incorrect delete pin" },
                { status: 404 }
            );
        }

        await database`DELETE FROM rooms WHERE id = ${roomId}`;

        return NextResponse.json(
            { message: "Room deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting room:", error)
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        )
    }
}