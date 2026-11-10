"use client"

import { useEffect, useState } from "react"
import { Folder, FolderStructure, RoomData } from "../_types/customTypes"

interface FoldersContainerProps {
    room: RoomData,
    setRoom: (room: RoomData) => void,
    folderState: FolderStructure,
    setFolderState: (state: FolderStructure) => void,
    moveFolderInstance: Folder | null,
    setMoveFolderInstance: (folder: Folder | null) => void
}


function FoldersContainer(FoldersContainerProps: FoldersContainerProps) {
    const { room, setRoom, folderState, setFolderState, moveFolderInstance, setMoveFolderInstance } = FoldersContainerProps
    const [renameFolderPopup, setRenameFolderPopup] = useState<{ id: string, name: string } | null>(null)
    const [folderMenuPopup, setFolderMenuPopup] = useState<{ id: string, open: boolean }>({ id: "", open: false })
    const [containerFolders, setContainerFolders] = useState<Folder[]>([])
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        const refreshingFolders = room?.folders?.filter(f => f.parent_folder_id === (folderState.currentFolder?.id || null))
        setContainerFolders(refreshingFolders || [])

    }, [folderState.currentFolder, room?.folders])

    const updateFolderName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setProcessing(true)
        try {

            const name = (e.currentTarget.elements[1] as HTMLInputElement).value
            const folder_id = (e.currentTarget.elements[0] as HTMLInputElement).value

            if (!name) {
                throw new Error("Folder name is required")
            }

            const response = await fetch(`/api/folder/${room.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    folder_id: folder_id,
                    parent_folder_id: null
                })
            })

            if (response.ok) {
                const updatedRoom = await fetch(`/api/room/${room.id}`)
                const updatedRoomData: RoomData = await updatedRoom.json()
                setRoom(updatedRoomData)
                setRenameFolderPopup(null)
                alert("Folder name updated successfully")
            }

        } catch (error) {
            alert(error)
        }finally {
            setProcessing(false)
        }
    }

    const handleDeleteFolder = async (folderId: string, folderName: string) => {

        const confirmDelete = confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)
        if (confirmDelete) {
            try {
                if (!folderId) {
                    throw new Error("Folder ID is required")
                }
                const response = await fetch(`/api/folder/${room.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ folder_id: folderId })
                })
                if (response.ok) {
                    const updatedRoom = await fetch(`/api/room/${room.id}`)
                    const updatedRoomData: RoomData = await updatedRoom.json()
                    setRoom(updatedRoomData)
                    alert("Folder deleted successfully")
                }
            } catch (error) {
                alert(error)
            }
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                {folderState.parentFolder !== null ? folderState.parentFolder.name : "Root"}
                {folderState.currentFolder !== null && ` -> ${folderState.currentFolder.name}`}
            </div>
            {folderState.currentFolder !== null && (
                <div className="mb-6">
                    <button 
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-900 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    onClick={() => {
                        if (folderState.currentFolder !== null) {
                            const parentFolder = room?.folders?.find(f => f.id === folderState.currentFolder?.parent_folder_id) || null
                            setFolderState({
                                currentFolder: parentFolder,
                                parentFolder: room?.folders?.find(f => f.id === parentFolder?.parent_folder_id) || null
                            })
                        }
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#EA3323"><path d="M7.83,13l5.6,5.6L12,20L4,12l8-8l1.43,1.4L7.83,11H20v2H7.83Z"/></svg>
                        Back
                    </button>
                </div>)}
            {
                containerFolders?.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {containerFolders.map((folder) => (
                            <div key={folder.id}
                                className={`w-37.5 h-25 bg-gray-200 p-0.5 ${moveFolderInstance?.id === folder.id ? 'border-2 border-blue-500 animate-bounce' : ''} rounded-md relative hover:bg-gray-300 transition-colors duration-200`}
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
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFolderMenuPopup({ id: folder.id, open: true })
                                    }}>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        height="20px"
                                        width="20px" fill="#DA954B">
                                        <path d="M12,20q-0.82,0-1.41-0.59T10,18t0.59-1.41T12,16t1.41,0.59Q14,17.18 14,18t-0.59,1.41T12,20Zm0-6q-0.82,0-1.41-0.59T10,12t0.59-1.41T12,10t1.41,0.59Q14,11.18 14,12t-0.59,1.41T12,14Zm0-6q-0.82,0-1.41-0.59T10,6t0.59-1.41T12,4t1.41,0.59Q14,5.18 14,6T13.41,7.4１T１２，８Ｚ" />
                                    </svg>
                                </span>
                                {folderMenuPopup.id === folder.id && folderMenuPopup.open && (
                                    <div className="absolute right-0 top-3 z-40 flex flex-col justify-center items-center bg-white border border-gray-300 rounded-md shadow-md p-2"
                                        onMouseLeave={() => setFolderMenuPopup({ id: "", open: false })}>
                                        <div onClick={(e) => {
                                            e.stopPropagation()
                                        }}>

                                            <button className="w-full hover:bg-orange-300/35" onClick={(e) => {
                                                e.stopPropagation();
                                                setRenameFolderPopup({ id: folder.id, name: folder.name });
                                            }}>Change Name</button>
                                            <button className="w-full hover:bg-blue-300/35" onClick={(e) => {
                                                e.stopPropagation();
                                                setMoveFolderInstance(folder)
                                            }}>Move</button>
                                            <button className="w-full hover:bg-red-300/35" onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteFolder(folder.id, folder.name)
                                            }}>Delete</button>
                                        </div>
                                    </div>)}
                                <p className="font-mono text-xl">{folder.name}</p>

                            </div>
                        ))}
                        {renameFolderPopup && (
                            <div className="fixed inset-0 w-full h-full z-50 bg-black/10 backdrop-blur-lg items-center">
                                <div className="flex flex-col items-center justify-center h-full" onClick={(e) => {
                                    e.stopPropagation()
                                    setRenameFolderPopup(null)
                                }}>
                                    <div className="bg-white p-4 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                                        <h2 className="text-lg font-semibold mb-4">Update Folder name: {renameFolderPopup?.name}</h2>
                                        <form onSubmit={(e) => updateFolderName(e)} className="flex gap-2 justify-center items-center">
                                            <input type="text" name="folder_Id"
                                                readOnly={true}
                                                hidden={true}
                                                className="border border-gray-300 rounded-md p-2 "
                                                value={renameFolderPopup?.id}
                                            ></input>
                                            <input type="text"
                                                name="folder_name"
                                                defaultValue={renameFolderPopup?.name}
                                                placeholder="Folder Name"
                                                className="border border-gray-300 rounded-md p-2"></input>
                                            <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200" 
                                            type="submit" disabled={processing}>
                                                {processing ? 'Updating...' : 'Update'}
                                            </button>
                                            <button type="button"
                                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors duration-200"
                                                disabled={processing}
                                                onClick={() => setRenameFolderPopup(null)}>Cancel</button>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                )
            }

        </div>
    )
}

export default FoldersContainer