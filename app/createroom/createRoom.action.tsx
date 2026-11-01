"use server"

import { neon } from "@neondatabase/serverless";
import { customAlphabet, nanoid } from "nanoid";
import { DeletePin } from "../_types/customTypes";

export async function createRoom(previousState: any, formData: FormData): Promise<{
    success?: boolean;
    message?: string;
    error?: string;
    roomId?: string
    previousValues?: {
        roomName: string;
        delete_pin: string | null;
        confirm_delete_pin: string | null;
    };
}> {

    const { roomName, delete_pin, confirm_delete_pin } = Object.fromEntries(formData.entries()) as {
        roomName: string;
        delete_pin: string | null;
        confirm_delete_pin: string | null;
    };
    try {
        let finalPin: string | null = null

        console.log("Received form data:", { roomName, delete_pin, confirm_delete_pin });
        // throw new Error("This is a test error to check error handling in createRoom function.");
        if(delete_pin?.trim() !== "" )
        {

            if (delete_pin !== confirm_delete_pin) {
                throw new Error("Password pins do not match");
            }
            finalPin = delete_pin?.trim() as string
            
        }else{
            finalPin = DeletePin.NoPin
        }

        if (!roomName) {
                throw new Error("Room name is required");
            }

        const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)
        const roomId = nanoid(6)

        const database = neon(process.env.DATABASE_URL as string)

        await database`INSERT INTO rooms (id, name, delete_pin)
      VALUES (${roomId}, ${roomName.trim()}, ${finalPin.trim()})`

        return { success: true, message: "Room created successfully", roomId }
    } catch (error) {
        return { success: false,
            previousValues: { roomName, delete_pin, confirm_delete_pin }, message: "An error occurred while creating the room", error: (error as Error).message }
    }
}