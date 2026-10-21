"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { createRoom } from "../room/new/createroom/createRoom.action"
import { useUploadThing } from "../_lib/uploadThing"
import { useRouter } from "next/navigation"
import Link from "next/link"


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

            localStorage.setItem("roomId", typeof state.roomId === "string" ? state.roomId : "")

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
        <div className="max-w-7xl mx-6 px-4 py-10 text-neutral-900">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                    </svg>
                    Back to Home
                </Link>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Create a New Room</h2>

            {state?.success === false && (
                <div className="border-2 border-red-500 rounded-sm bg-red-50 text-red-600 text-sm p-3 mb-6 font-medium">
                    {state.error} {state.message && <><br />{state.message}</>}
                </div>
            )}
            {state?.success === true && (
                <div className="border-2 border-emerald-500 rounded-sm bg-emerald-50 text-emerald-700 text-sm p-3 mb-6 font-medium">
                    {state.message} | <span className="font-mono">{state.roomId}</span>
                </div>
            )}

            <form action={formAction} className="space-y-5">
                <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                        Room Name
                    </label>
                    <input
                        type="text"
                        name="roomName"
                        required
                        placeholder="e.g. Birthday Trip 2026"
                        className="w-full border-2 border-neutral-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                            Delete PIN (4 digits)
                        </label>
                        <input
                            type="password"
                            name="delete_pin"
                            placeholder="4781"
                            maxLength={4}
                            required
                            className="w-full border-2 border-neutral-300 rounded-sm px-4 py-2.5 text-sm tracking-widest focus:outline-none focus:border-neutral-900 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            name="confirm_delete_pin"
                            placeholder="4781"
                            maxLength={4}
                            required
                            className="w-full border-2 border-neutral-300 rounded-sm px-4 py-2.5 text-sm tracking-widest focus:outline-none focus:border-neutral-900 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                        Upload Photos (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        multiple
                        onChange={handlePhotoInputChange}
                        className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer border-2 border-dashed border-neutral-300 rounded-sm p-3"
                    />
                </div>

                {previewPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {previewPhotos.map((photoUrl, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-sm overflow-hidden border-2 border-neutral-300">
                                <img src={photoUrl} alt={`Selected ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSelectedPhoto(index)}
                                    className="absolute top-1 right-1 bg-neutral-900/80 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {uploadStatus && (
                    <p className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-2 text-center">
                        {uploadStatus}
                    </p>
                )}

                <p className="text-xs text-neutral-400">
                    * Note: Photos will automatically expire after 24 hours.
                </p>

                <button
                    type="submit"
                    disabled={isWorking}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-sm cursor-pointer"
                >
                    {isUploading ? "Uploading photos..." : isPending ? "Creating Room..." : "Create Room"}
                </button>
            </form>
        </div>
    )
}
