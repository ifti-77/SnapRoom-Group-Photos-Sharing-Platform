"use server"

import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";

export async function createRoom(previousState: any, formData: FormData): Promise<{
    success?: boolean;
    message?: string;
    error?: string;
    roomId?: string
}> {

    const { roomName, delete_pin, confirm_delete_pin } = Object.fromEntries(formData.entries()) as {
        roomName: string;
        delete_pin: string;
        confirm_delete_pin: string;
    };
    try {
        if (delete_pin !== confirm_delete_pin) {
            throw new Error("Delete pins do not match");
        }

        if (!roomName) {
            throw new Error("Room name is required");
        }

        const roomId = nanoid(6)

        const database = neon(process.env.DATABASE_URL as string);

        await database`INSERT INTO rooms (id, name, delete_pin)
      VALUES (${roomId}, ${roomName.trim()}, ${delete_pin.trim()})`;

        return { success: true, message: "Room created successfully", roomId };
    } catch (error) {
        return { success: false, message: "An error occurred while creating the room", error: (error as Error).message };
    }
}