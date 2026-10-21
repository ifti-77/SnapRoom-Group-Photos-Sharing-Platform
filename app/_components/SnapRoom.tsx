"use client"

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { UploadButton } from "../_lib/uploadThing";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

interface Room {
  id: string
  name: string
  delete_pin: string
}

export default function SnapRoom({ params }: { params: Promise<{ roomId: string }> }) {

  const resolvedParams = use(params)
  const roomId = resolvedParams?.roomId
  const router = useRouter()
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [photos, setPhotos] = useState<{ url: string, id: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [selectMultiple, setSelectMultiple] = useState<boolean>(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])

  const [deleteRoomPopup, setDeleteRoomPopup] = useState<boolean>(false)

  useEffect(() => {
    if (!roomId) {
      router.push("/")
    }
    fetchRoom()

  }, [roomId])

  useEffect(() => {

    fetchPhotos()
  }, [roomId])

  async function fetchPhotos() {
    try {
      const result = await fetch(`/api/photos/${roomId}`, { cache: "no-store" });
      if (!result.ok) {
        alert("Failed to fetch photos")
        return
      }
      const data = await result.json();
      setPhotos(data)
    } catch (err) {
      alert(`Fetch error: ${err}`)
    } finally {
      setLoading(false);
    }

  }
  async function fetchRoom() {
    try {
      const response = await fetch(`/api/room/${roomId}`, { cache: "no-store" })
      console.log("Response status:", typeof response.status)
      if (!response.ok && response.status === 404) {
        setRoomNotFound(true)
        return
      }
      const data = await response.json()
      setRoom(data)
    } catch (error) {
      alert(`Error fetching room: ${error}`)
    }
  }

  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const photoType = blob.type.split("/")[1] || "jpg"
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl;
      a.download = `photo-${roomId}-${index + 1}.${photoType}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      window.open(url, "_blank")
    }
  }

  const selectMultipleImages = (image: string) => {

    setSelectedPhotos((prev) =>
      prev.includes(image) ? prev.filter((img) => img !== image) : [...prev, image]
    )
  }

  const handleSelectAll = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos([...photos.map((photo) => photo.url)]);
    }
  }

  const handleDownloadZip = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      setIsZipping(true);
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();

      await Promise.all(
        selectedPhotos.map(async (url, idx) => {
          const res = await fetch(url);
          const blob = await res.blob();
          const mimeSubtype = blob.type.split("/")[1] || "jpg"
          const ext = mimeSubtype === "jpeg" ? "jpg" : mimeSubtype.split("+")[0]

          zip.file(`photo-${roomId}-${idx + 1}.${ext}`, blob)
        })
      )

      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, `room-${roomId}-photos.zip`)

      setSelectedPhotos([])
      setSelectMultiple(false)
    } catch (err) {
      console.error("Failed to create ZIP:", err)
      alert("Failed to download ZIP.")
    } finally {
      setIsZipping(false)
    }
  }

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
        body: JSON.stringify({ photoId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    } catch (error) {
      alert(`Error deleting photo: ${error}`)
    }
  }

  const handleDeleteRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const delete_pin = (e.currentTarget.elements[0] as HTMLInputElement).value

    if (!delete_pin) {
      alert("Please enter the delete pin.")
      return
    }

    try {
      const res = await fetch(`/api/room/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delete_pin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error );
      }
      alert("Room deleted successfully.")
      localStorage.removeItem("roomId")
      router.push("/")
    } catch (error) {
      alert(`Error deleting room: ${error}`)
    }
  }

  if (roomNotFound) {
    return (<>
      <div className="text-center border border-red-400 rounded-lg p-8 mt-32 m-4">
        <h4
          className="text-lg font-semibold text-neutral-900"
        >Room not found.
        </h4>
        <p className="text-sm text-neutral-500 mt-2">
          The room you are trying to access does not exist. Please check the room ID and try again.
        </p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back to Home
        </Link>
      </div>
    </>)
  }

  return (
    <div className="max-w-9xl mx-auto px-4 py-8 text-neutral-900">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Room: {room?.name || "No room found"}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Share ID with friends:{" "}
            <span className="font-mono text-xs bg-neutral-100 text-neutral-800 border border-neutral-300 px-2 py-0.5 rounded">
              {roomId}
            </span>
          </p>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded" 
          onClick={() => setDeleteRoomPopup(true)}>Delete Room</button>
        </div>


        <div className="flex flex-wrap items-center gap-2">
          {photos.length > 0 && (
            <button
              type="button"
              className="border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-sm font-medium px-3.5 py-2 rounded"
              onClick={() => setSelectMultiple(!selectMultiple)}
            >
              {selectMultiple ? "Cancel" : "Select Photos"}
            </button>
          )}
          {selectMultiple && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-sm font-medium px-3.5 py-2 rounded"
              >
                {selectedPhotos.length === photos.length
                  ? "Deselect All"
                  : "Select All"}
              </button>

              <button
                type="button"
                disabled={selectedPhotos.length <= 1 || isZipping}
                onClick={handleDownloadZip}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
              >
                {isZipping
                  ? "Zipping..."
                  : `Download ZIP (${selectedPhotos.length})`}
              </button>
            </>
          )}
          {roomId && (
            <div className="shrink-0">
              <UploadButton
                input={{ roomId }}
                endpoint="imageUploader"
                appearance={{
                  container: "items-start sm:items-end",
                  button:
                    "bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded h-auto",
                  allowedContent: "text-xs text-neutral-500 mt-1",
                }}
                onClientUploadComplete={async () => {
                  await fetchPhotos();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {loading && (
        <LoadingScreen
          message="Loading dumps.."
          subtext="unpacking snaps hangtight,, don't close the tab"
          fullScreen={true}
        />
      )}

      {!loading && photos.length === 0 && (
        <div className="border border-dashed border-neutral-300 rounded py-12 text-center">
          <p className="text-neutral-500 text-sm">No photos in this room yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotos.includes(photo.url);

          return (
            <div
              key={photo.id}
              onClick={() => {
                if (selectMultiple) {
                  selectMultipleImages(photo.url)
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
                className="w-full h-full object-cover"
              />

              {selectMultiple && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => selectMultipleImages(photo.url)}
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
                    &times;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {deleteRoomPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl border border-neutral-200 text-neutral-900">
            <h3 className="text-lg font-bold">Delete Room</h3>
            <p className="text-sm text-neutral-600 mt-1 mb-4">
              Enter the 4-digit host PIN to delete this room and all its photos.
          </p>

          <form onSubmit={(e) => handleDeleteRoom(e)}>
            <input
              type="password"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-neutral-900 mb-4"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteRoomPopup(false)} // handle close popup
                className="border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-sm font-medium px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded"
              >
                Confirm Delete
              </button>
            </div>
          </form>
        </div>
      </div>)}

    </div>
  )
}
