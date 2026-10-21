"use client"
"no-cache"

import Link from "next/link"
import { useEffect, useState } from "react";


const StoredRoom = () => {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    useEffect(() => {
        const roomId = localStorage.getItem("roomId")
        if (roomId) {
            setCurrentRoomId(roomId)
        }else{
            setCurrentRoomId(null)
        }
    },[])
    return (
        <div>
            {currentRoomId && (
                <>
                    <p>Created Room ID: {currentRoomId}</p>
                    <Link href={`/room/${currentRoomId}`}>Go to Room</Link>
                </>
            )}
        </div>
    )
}

export default StoredRoom
