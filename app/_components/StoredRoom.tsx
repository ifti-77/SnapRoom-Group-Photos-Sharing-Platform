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
        } else {
            setCurrentRoomId(null)
        }
    }, [])
    if (!currentRoomId) { return null }
    return (
        <div className="mt-3 p-4 border-2 border-neutral-900 bg-neutral-50 rounded-md flex items-center justify-between gap-4 max-w-md">
            <div>
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">Recent Room</p>
                <p className="font-mono font-bold text-neutral-900">{currentRoomId}</p>
            </div>
            <Link
                href={`/room/${currentRoomId}`}
                className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-sm hover:bg-neutral-800 transition-colors"
            >
                Go to Room &rarr;
            </Link>
        </div>
    )
}

export default StoredRoom
