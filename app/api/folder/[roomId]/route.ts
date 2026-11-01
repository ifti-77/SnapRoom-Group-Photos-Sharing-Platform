import { neon } from "@neondatabase/serverless"

// export async function GET(request: Request, { params }: { params: { roomId: string } }) {

//     const roomId = await params.roomId

//     const database = await neon(process.env.DATABASE_URL as string)

//     const room = await database`SELECT * FROM folders WHERE room_id = ${roomId}`
// }

export async function POST(request: Request, { params }: { params: Promise<{ roomId: string }> }) {

    try {
    const {roomId} = await params
    const body = await request.json()
    const { name }:{ name: string} = body

    const database = await neon(process.env.DATABASE_URL as string)

    const [folder] = await database`INSERT INTO folders (name, room_id) VALUES (${name.trim()}, ${roomId}) RETURNING *`
    return new Response(JSON.stringify(folder), { status: 201 })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error || "Failed to create folder" }),
            { status: 500 }
        )
    }
}