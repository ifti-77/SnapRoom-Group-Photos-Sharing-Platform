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
    const { name, parent_folder_id }:{ name: string, parent_folder_id: string | null } = body
    const database = await neon(process.env.DATABASE_URL as string)

    const [folder] = await database`INSERT INTO folders (name, room_id, parent_folder_id) VALUES (${name.trim()}, ${roomId}, ${parent_folder_id}) RETURNING *`
    return new Response(JSON.stringify(folder), { status: 201 })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error || "Failed to create folder" }),
            { status: 500 }
        )
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ roomId: string }> }) {

    try {
        const { roomId } = await params
        const body = await request.json()
        const { name,parent_folder_id, folder_id }:{ name: string, parent_folder_id: string | null, folder_id: string } = body
        if (!folder_id) {
            throw new Error("Folder ID is required")
        }
        if (!name) {
            throw new Error("Folder name is required")
        }
        if (parent_folder_id === folder_id) {
            throw new Error("Parent folder ID cannot be the same as folder ID")
        }
        
        const database = await neon(process.env.DATABASE_URL as string)
        const [folder] = parent_folder_id === undefined ? await database`UPDATE folders 
                                                                    SET name = ${name.trim()} 
                                                                    WHERE id = ${folder_id} 
                                                                    RETURNING *` : await database`UPDATE folders
                                                                    SET name = ${name.trim()}, parent_folder_id = ${parent_folder_id} 
                                                                    WHERE id = ${folder_id} 
                                                                    RETURNING *`
        return new Response(JSON.stringify(folder), { status: 200 })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error || "Failed to update folder" }),
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ roomId: string }> }) {

    try {
        const { roomId } = await params
        const body = await request.json()
        const { folder_id }:{ folder_id: string } = body
        if (!folder_id) {
            throw new Error("Folder ID is required")
        }
        
        const database = await neon(process.env.DATABASE_URL as string)
        await database`DELETE FROM folders WHERE id = ${folder_id} AND room_id = ${roomId}`
        return new Response(JSON.stringify({ message: "Folder deleted successfully" }), { status: 200 })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error || "Failed to delete folder" }),
            { status: 500 }
        )
    }
}