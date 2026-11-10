import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { UTApi } from "uploadthing/server";
import { pusherServer } from "@/app/_lib/pusherServer";

const utapi = new UTApi();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    let { roomId, } = await params;

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }



    const sql = neon(process.env.DATABASE_URL!);

    const photos = await sql`
      SELECT id, url, file_key, name 
      FROM photos 
      WHERE room_id = ${roomId}
      ORDER BY created_at DESC
    `;

    const photoUrls = photos.map((p) => ({ url: p.url, id: p.id }));

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

    const sql = await neon(process.env.DATABASE_URL!)
    const { photoIds }: { photoIds: string[] } = body

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: "photoIds array is required and must not be empty" },
        { status: 400 }
      )
    }

    const photosToDelete = await sql`
      SELECT id, file_key 
      FROM photos 
      WHERE room_id = ${roomId} 
        AND id = ANY(${photoIds})
    `;

    if (photosToDelete.length === 0) {
      return NextResponse.json(
        { error: "No matching photos found to delete" },
        { status: 404 }
      );
    }

    const fileKeys = photosToDelete
      .map((p) => p.file_key)
      .filter((key): key is string => Boolean(key));


    if (fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys);
    }

    await sql`
      DELETE FROM photos 
      WHERE room_id = ${roomId} 
        AND id = ANY(${photoIds})
    `;

    await pusherServer.trigger(`room-${roomId}`, "photos:deleted", {
      message: "Photos deleted"
    })
    return NextResponse.json(
      {
        success: true,
        deletedCount: photosToDelete.length,
      },
      { status: 200 }
    );
  } catch (error) {

    return NextResponse.json(
      { error: "Failed to delete photos" },
      { status: 500 }
    );
  }
}