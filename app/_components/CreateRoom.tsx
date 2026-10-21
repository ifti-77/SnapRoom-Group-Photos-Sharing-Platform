"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { createRoom } from "../room/createroom/createRoom.action"
import { useUploadThing } from "../_lib/uploadThing"
import { useRouter } from "next/navigation"


export default function CreateRoom() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(createRoom, null)
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<string>("")


    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onUploadProgress: (progress) => {
            setUploadStatus(`Uploading: ${progress}%`);
        },
    })



    const photoInputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        if (!state?.success || !state?.roomId) return
        const handlePhotoUploadComplete = async () => {

            localStorage.setItem("roomId", typeof state.roomId=== "string"? state.roomId: "")

            if (selectedPhotos.length === 0) {
                setUploadStatus("No photos to upload.")
                return router.push(`/room/${state.roomId}`)
            }

            setUploadStatus("Photo uploading...")

            await startUpload(selectedPhotos, { roomId: (state?.roomId) as string });

            
            previewPhotos.forEach((url) => URL.revokeObjectURL(url))
            router.push(`/room/${state.roomId}`)

        }
        handlePhotoUploadComplete()
    }, [state]);


    const syncNativeInput = (files: File[]) => {
        if (!photoInputRef.current) return

        if (files.length === 0) {
            photoInputRef.current.value = ""
            return
        }


        const dataTransfer = new DataTransfer()
        files.forEach((file) => dataTransfer.items.add(file))
        photoInputRef.current.files = dataTransfer.files
    }

    const handlePhotoInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return

        const newFiles = Array.from(event.target.files)
        const combinedFiles = [...selectedPhotos, ...newFiles]

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
        setPreviewPhotos((prev) => [...prev, ...newPreviews])
        setSelectedPhotos(combinedFiles)

        syncNativeInput(combinedFiles)
    }


    const handleRemoveSelectedPhoto = (index: number) => {

        URL.revokeObjectURL(previewPhotos[index])

        const updatedPhotos = selectedPhotos.filter((_, i) => i !== index)
        const updatedPreviews = previewPhotos.filter((_, i) => i !== index)

        setSelectedPhotos(updatedPhotos)
        setPreviewPhotos(updatedPreviews)

        syncNativeInput(updatedPhotos)
    }

    const isWorking = isPending || isUploading

    return (
        <div>
            <h2>Create Room</h2>
            {state?.success === false && <p className=" border-2 border-red-500 rounded-lg bg-transparent text-red-500 text-center px-1.5 py-2 m-1">
                {state.error} <br /> {state.message}</p>}
            {state?.success === true && <p className=" border-2 border-green-500 rounded-lg bg-transparent text-green-500 text-center px-1.5 py-2 m-1">
                {state.message} | {state.roomId}</p>}
            <form action={formAction}>
                <label>
                    Room Name:
                    <input type="text" name="roomName" />
                </label><br />
                <label>
                    Room Delete Pin:
                    <input type='password' name='delete_pin' placeholder='e.g. 4781' maxLength={4} /> <br />
                    confirm Delete Pin:
                    <input type='password' name='confirm_delete_pin' placeholder='e.g. 4781' maxLength={4} />
                </label><br />
                <label>Upload Photos</label> <br />
                <input type="file" accept="image/*"
                    ref={photoInputRef}
                    multiple
                    onChange={handlePhotoInputChange} /> <br />
                <div className="flex flex-wrap gap-2">
                    {previewPhotos.length > 0 && previewPhotos.map((photoUrl, index) => (
                        <div key={index} className="relative">
                            <img src={photoUrl} alt={`Selected Photo ${index + 1}`} className="w-20 h-20 object-cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveSelectedPhoto(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                {uploadStatus && <p>{uploadStatus}</p>}
                <p className="text-sm text-muted-foreground">
                    Note: Photos will be deleted after 24 hours.
                </p>
                <button type="submit" disabled={isWorking}>
                    {isUploading ? "Uploading photos..." : isPending ? "Creating Room..." : "Create Room"}
                </button>
            </form>
        </div>
    )
}
