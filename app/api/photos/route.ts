import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(
  request: Request) {
  try {
    const { searchParams } = await new URL(request.url)
    const roomId = await searchParams.get("roomId")
    const folderId = await searchParams.get("folderId")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    

    const sql = neon(process.env.DATABASE_URL!);

    const photos = folderId? await sql`
      SELECT id, url, file_key, name 
      FROM photos 
      WHERE room_id = ${roomId} AND folder_id = ${folderId}
      ORDER BY created_at DESC
    `: await sql`
      SELECT id, url, file_key, name 
      FROM photos 
      WHERE room_id = ${roomId} AND folder_id IS NULL
      ORDER BY created_at DESC
    `;

    const photoUrls = photos.map((p) => ({url:p.url, id: p.id}));

    return NextResponse.json(photoUrls);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    if (!body || !body.photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const { photoId } = body

    await sql`
      DELETE FROM photos 
      WHERE room_id = ${roomId} AND id = ${photoId}
    `;
    return NextResponse.json({ message: "Photo deleted successfully" });
  }catch (error) {
    console.error("Error deleting photos:", error);
    return NextResponse.json(
      { error: "Failed to delete photos" },
      { status: 500 }
    );
  }
}