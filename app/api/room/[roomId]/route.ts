import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params
        const database = neon(process.env.DATABASE_URL as string)

        await database`DELETE FROM rooms WHERE id = ${roomId}`
        return NextResponse.json({ message: "Room deleted successfully" })
    } catch (error) {
        console.error("Error deleting room:", error)
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        )
    }
}