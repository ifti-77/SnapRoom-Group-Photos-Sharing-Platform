import { useState } from "react"
import { FolderStructure } from "../_types/customTypes"



function CreateFolderSystem({ roomId, folderState, fetchRoom }: { roomId: string, folderState: FolderStructure, fetchRoom: () => void }) {

    const [createFolderPopup, setCreateFolderPopup] = useState(false)

    const createFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {

            const name = (e.currentTarget.elements[0] as HTMLInputElement).value

            if (!name) {
                throw new Error("Folder name is required")
            }
            const respone = await fetch(`/api/folder/${roomId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: name, parent_folder_id: folderState.currentFolder?.id || null })
            })

            if (!respone.ok) {
                throw new Error("Failed to create folder")
            }

            setCreateFolderPopup(false)
            fetchRoom()
            alert("Folder created successfully")
        } catch (error) {
            alert(error)
        }

    }


    return (
        <div>
            <button className="btn btn-primary"
                onClick={() => setCreateFolderPopup(true)}>Create Folder</button>
            {createFolderPopup && (
                <div className="fixed inset-0 w-full h-full z-50 bg-black/10 backdrop-blur-lg items-center">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-white p-4 rounded shadow-md">
                            <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
                            <form onSubmit={(e) => createFolder(e)}>
                                <input type="text"
                                    placeholder="Folder Name"
                                    className="border border-gray-300 rounded-md p-2 mb-4"></input>
                                <button className="btn btn-primary" type="submit">Create</button>
                                <button type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setCreateFolderPopup(false)}>Cancel</button>
                            </form>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default CreateFolderSystem