
import React from 'react'
import { Photo } from '../_types/customTypes'

const PhotoContainer = ({ photos, setPhotos, roomId,
    selectedPhotos,
    selectMultipleImages,
    selectMultiple,
    handleDownload }: {
        photos: Photo[], setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>,
        roomId: string,
        selectedPhotos: Photo[],
        selectMultipleImages: (photo: Photo) => void,
        selectMultiple: boolean
        handleDownload: (url: string, index: number) => void
    }) => {

    const [fullScreenPhoto, setFullScreenPhoto] = React.useState<{photo:Photo, index:number} | null>(null)
    const handleDeletePhoto = async (photoId: string) => {

        if (!confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/photos/${roomId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ photoIds: [photoId] }),
            });

            if (!res.ok) {
                throw new Error("Failed to delete photo");
            }
            setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        } catch (error) {
            alert(`Error deleting photo: ${error}`)
        }
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => {
                const isSelected = selectedPhotos.includes(photo);

                return (
                    <div
                        key={photo.id}
                        onClick={() => {
                            if (selectMultiple) {
                                selectMultipleImages(photo)
                            }
                        }}
                        className={`relative aspect-square rounded overflow-hidden border bg-neutral-100 ${selectMultiple ? "cursor-pointer" : ""
                            } ${isSelected
                                ? "border-blue-600 ring-2 ring-blue-600"
                                : "border-neutral-200"
                            }`}
                    >
                        <img
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            onClick={() => {
                                if (!selectMultiple) {
                                    setFullScreenPhoto({photo, index})
                                }
                            }}
                            className="w-full h-full object-cover"
                        />

                        {selectMultiple && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => selectMultipleImages(photo)}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-2.5 left-2.5 w-4 h-4 accent-blue-600 cursor-pointer pointer-events-none"
                            />
                        )}

                        {!selectMultiple && (
                            <div className="absolute top-2 right-2 flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(photo.url, index)}
                                    className="bg-black/75 hover:bg-black text-white rounded w-7 h-7 flex items-center justify-center"
                                    title="Download photo"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5"
                                        />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    className="bg-black/75 hover:bg-red-600 text-white rounded w-7 h-7 flex items-center justify-center text-base leading-none"
                                    title="Delete photo"
                                    onClick={() => {
                                        handleDeletePhoto(photo.id)
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#EA3323"><path d="M7,21q-0.82,0-1.41-0.59T5,19V6H4V4H9V3h6V4h5V6H19V19q0,0.82-0.59,1.41T17,21H7ZM17,6H7V19H17V6ZM9,17h2V8H9v9Zm4,0h2V8H13v9ZM7,6V19V6Z"/></svg>
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
            {
                fullScreenPhoto && (
                    <div className="fixed inset-0 w-full h-full z-50 bg-black/10 backdrop-blur-lg items-center">
                        <div className="relative flex flex-col items-center justify-center h-full">
                            <div className="absolute top-2 right-2 flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(fullScreenPhoto.photo.url, fullScreenPhoto.index)}
                                    className="bg-black/75 hover:bg-black text-white rounded w-9 h-9 flex items-center justify-center"
                                    title="Download photo"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-3.5 h-3.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5"
                                        />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    className="bg-black/75 hover:bg-red-600 text-white rounded w-9 h-9 flex items-center justify-center text-base leading-none"
                                    title="Delete photo"
                                    onClick={() => {
                                        handleDeletePhoto(fullScreenPhoto.photo.id)
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#EA3323"><path d="M7,21q-0.82,0-1.41-0.59T5,19V6H4V4H9V3h6V4h5V6H19V19q0,0.82-0.59,1.41T17,21H7ZM17,6H7V19H17V6ZM9,17h2V8H9v9Zm4,0h2V8H13v9ZM7,6V19V6Z"/></svg>
                                </button>
                                <button
                                    className=" bg-black/75 hover:bg-orange-600 text-white rounded w-9 h-9 flex items-center justify-center text-lg leading-none"
                                    onClick={() => setFullScreenPhoto(null)}
                                >
                                    &times;
                                </button>
                                </div>
                                <img
                                    src={fullScreenPhoto.photo.url}
                                    alt={`Photo ${fullScreenPhoto.index + 1}`}
                                    className="w-full h-full object-bottom object-contain max-h-[90vh] max-w-[90vw]"
                                />
                        </div>

                    </div>)
            }
        </div>
    )
}

export default PhotoContainer