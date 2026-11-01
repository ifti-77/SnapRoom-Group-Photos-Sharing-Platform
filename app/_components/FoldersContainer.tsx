"use client"

import { RoomData } from "../_types/customTypes"



function FoldersContainer({room}:{room:RoomData}) {



    return (
    <div>
        {
            room?.folders?.length > 0 && (
                <div className="flex flex-wrap gap-4">
                    {room.folders.map((folder) => (
                        <div key={folder.id} className="bg-gray-200 p-4 rounded-md">
                            <h3 className="font-bold">{folder.name}</h3>
                            <p className="text-sm text-gray-500">{folder.created_at}</p>
                        </div>
                    ))}
                </div>
            )
        }
    </div>
  )
}

export default FoldersContainer