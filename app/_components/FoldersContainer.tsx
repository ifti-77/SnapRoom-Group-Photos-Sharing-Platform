"use client"

import { FolderStructure, RoomData } from "../_types/customTypes"



function FoldersContainer({ room, folderState, setFolderState }: {
    room: RoomData, folderState: FolderStructure,
    setFolderState: (state: FolderStructure) => void
}) {

    const containerFolders = room.folders.filter(f => f.parent_folder_id === (folderState.currentFolder?.id || null))


    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                {folderState.parentFolder !== null ? folderState.parentFolder.name : "Root"}
                {folderState.currentFolder !== null && ` -> ${folderState.currentFolder.name}`}
            </div>
            {folderState.currentFolder !== null && (
                <div>
                <button onClick={() => {
                    if (folderState.currentFolder !== null) {
                        const parentFolder = room.folders.find(f => f.id === folderState.currentFolder?.parent_folder_id) || null
                        setFolderState({
                            currentFolder: parentFolder,
                            parentFolder: room.folders.find(f => f.id === parentFolder?.parent_folder_id) || null
                        })
                    }
                }}>
                    Back
                </button>
            </div>)}
            {
                containerFolders.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {containerFolders.map((folder) => (
                            <button key={folder.id}
                                className="bg-gray-200 p-4 rounded-md"
                                onClick={() => {
                                    setFolderState({
                                        currentFolder: folder,
                                        parentFolder: room.folders.find(f => f.id === folder.parent_folder_id) || null
                                    })
                                }}>
                                <h3 className="font-bold">{folder.name}</h3>
                            </button>
                        ))}
                    </div>
                )
            }
        </div>
    )
}

export default FoldersContainer