"use client"

import { FolderStructure, RoomData } from "../_types/customTypes"



function FoldersContainer({ room, folderState, setFolderState }: {
    room: RoomData, folderState: FolderStructure,
    setFolderState: (state: FolderStructure) => void
}) {

    const containerFolders = room?.folders?.filter(f => f.parent_folder_id === (folderState.currentFolder?.id || null))


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
                            const parentFolder = room?.folders?.find(f => f.id === folderState.currentFolder?.parent_folder_id) || null
                            setFolderState({
                                currentFolder: parentFolder,
                                parentFolder: room?.folders?.find(f => f.id === parentFolder?.parent_folder_id) || null
                            })
                        }
                    }}>
                        Back
                    </button>
                </div>)}
            {
                containerFolders?.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {containerFolders.map((folder) => (
                            <button key={folder.id}
                                className="w-37.5 h-25 bg-gray-200 p-0.5 rounded-md relative hover:bg-gray-300 transition-colors duration-200"
                                onClick={() => {
                                    setFolderState({
                                        currentFolder: folder,
                                        parentFolder: room?.folders?.find(f => f.id === folder.parent_folder_id) || null
                                    })
                                }}>
                                <span className="">
                                    <svg className="w-10 h-10 text-gray-800 dark:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="#DA954B" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M3 6a2 2 0 0 1 2-2h5.532a2 2 0 0 1 1.536.72l1.9 2.28H3V6Zm0 3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3Z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span className="absolute right-0 top-1 bg-transparent hover:bg-gray-200 rounded-full p-0.5"
                                    onClick={(e) => {  alert("hello"); e.stopPropagation() }}>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        height="20px"
                                        width="20px" fill="#DA954B">
                                        <path d="M12,20q-0.82,0-1.41-0.59T10,18t0.59-1.41T12,16t1.41,0.59Q14,17.18 14,18t-0.59,1.41T12,20Zm0-6q-0.82,0-1.41-0.59T10,12t0.59-1.41T12,10t1.41,0.59Q14,11.18 14,12t-0.59,1.41T12,14Zm0-6q-0.82,0-1.41-0.59T10,6t0.59-1.41T12,4t1.41,0.59Q14,5.18 14,6T13.41,7.41T12,8Z" />
                                    </svg>
                                </span>
                                <p className="font-mono text-xl">{folder.name}</p>
                            </button>
                        ))}
                    </div>
                )
            }
        </div>
    )
}

export default FoldersContainer