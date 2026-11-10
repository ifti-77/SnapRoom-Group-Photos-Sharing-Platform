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
        return NextResponse.json(room[0])
    } catch (error) {

        return NextResponse.json(
            { error: error || "Failed to fetch room data" },
            { status: 500 }
        )
    }
}


