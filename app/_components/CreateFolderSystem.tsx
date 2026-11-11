import { useState } from "react"
import { FolderStructure } from "../_types/customTypes"



function CreateFolderSystem({ roomId, folderState, fetchRoom }: { roomId: string, folderState: FolderStructure, fetchRoom: () => void }) {

    const [createFolderPopup, setCreateFolderPopup] = useState(false)
    const [processing, setProcessing] = useState(false)


    const createFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {

            const name = (e.currentTarget.elements[0] as HTMLInputElement).value

            if (!name) {
                throw new Error("Folder name is required")
            }
            setProcessing(true)
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
        finally {
            setProcessing(false)
        }

    }


    return (
        <div>
            <button className="w-full text-center px-1 py-2 text-md font-mono text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors duration-200"
                onClick={() => setCreateFolderPopup(true)}>
                <span className="flex justify-center items-start gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#e8eaed"><path d="M14,16h2V14h2V12H16V10H14v2H12v2h2v2ZM4,20q-0.82,0-1.41-0.59T2,18V6Q2,5.18 2.59,4.59T4,4h6l2,2h8q0.83,0 1.41,0.59Q22,7.18 22,8V18q0,0.82-0.59,1.41T20,20H4Zm0-2H20V8H11.18l-2-2H4V18Zm0,0V6V8V18Z" /></svg>
                    Create Folder</span>
            </button>

            {createFolderPopup && (
                <div className="fixed inset-0 w-full h-full z-50 bg-black/10 backdrop-blur-lg items-center">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-white p-4 rounded shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
                            <form onSubmit={(e) => createFolder(e)} className="flex gap-2 justify-center items-center">
                                <input type="text"
                                    placeholder="Folder Name"
                                    className="border border-gray-300 rounded-md p-2"></input>
                                <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
                                    type="submit"
                                    disabled={processing}
                                >{processing ? "Creating.." : "Create"}</button>
                                <button type="button"
                                    disabled={processing}
                                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors duration-200"
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