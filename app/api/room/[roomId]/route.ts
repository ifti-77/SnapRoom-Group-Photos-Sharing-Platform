import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params
        const database = await neon(process.env.DATABASE_URL as string)
        const room = await database`SELECT 
                                    r.id, 
                                    r.name, 
                                    r.delete_pin,
                                    COALESCE(
                                        json_agg(
                                            json_build_object(
                                                'id', f.id,
                                                'name', f.name,
                                                'parent_folder_id', f.parent_folder_id,
                                                'created_at', f.created_at
                                            ) ORDER BY f.created_at ASC
                                        ) FILTER (WHERE f.id IS NOT NULL),
                                        '[]'
                                    ) AS folders
                                FROM rooms r
                                LEFT JOIN folders f ON r.id = f.room_id
                                WHERE r.id = ${roomId}
                                GROUP BY r.id`
        if (room.length === 0) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }
        // console.log("Fetched room:", room[0])
        return NextResponse.json(room[0])
    } catch (error) {
        console.error("Error fetching room:", error)
        return NextResponse.json(
            { error: "Failed to fetch room" },
            { status: 500 }
        )
    }
}

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
            Select * from rooms where id = ${roomId} and delete_pin = ${String(delete_pin).trim()}
        `;


        if (!currentRoom || currentRoom.length === 0) {
            return NextResponse.json(
                { error: "Room not found or incorrect password" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, room: currentRoom[0] }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: error || "Failed to verify password" },
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

        const database = await neon(process.env.DATABASE_URL as string)

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