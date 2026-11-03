"use client"

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { UploadButton } from "../_lib/uploadThing";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen";
import { QRCodeSVG } from "qrcode.react";
import { DeletePin, FolderStructure, RoomData } from "../_types/customTypes"
import PasswordPupUp from "./PasswordPupUp";
import { getCookie } from "cookies-next"
import CreateFolderSystem from "./CreateFolderSystem";
import FoldersContainer from "./FoldersContainer";
import PhotoContainer from "./PhotoContainer";





export default function SnapRoom({ params }: { params: Promise<{ roomId: string }> }) {

  const resolvedParams = use(params)
  const roomId = resolvedParams?.roomId
  const router = useRouter()
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [room, setRoom] = useState<RoomData | null>(null)
  const [photos, setPhotos] = useState<{ url: string, id: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectMultiple, setSelectMultiple] = useState<boolean>(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])


  const [deleteRoomPopup, setDeleteRoomPopup] = useState<boolean>(false)
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false)

  const [roomOwner, setRoomOwner] = useState<boolean>(false)
  const [downloadAsZip, setDownloadAsZip] = useState<boolean>(false)

  const [showQRCode, setShowQRCode] = useState<boolean>(false)

  const [folderState, setFolderState] = useState<FolderStructure>({ currentFolder: null, parentFolder: null })

  const roomUrl = typeof window !== "undefined" ? window.location.href : ""

  useEffect(() => {
    if (!roomId) {
      router.push("/")
    }
    fetchRoom()

  }, [roomId])

  useEffect(() => {
    if (!roomId) {
      router.push("/")
    }
    fetchPhotos()

  }, [roomId, folderState.currentFolder])


  async function fetchPhotos() {
    try {
      const result = await fetch(`/api/photos?roomId=${roomId}${folderState.currentFolder !== null ? `&folderId=${folderState.currentFolder?.id || ""}` : ""}`, { cache: "no-store" });
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

      const owner = localStorage.getItem("roomId") === data?.id ? true : false
      setRoomOwner(owner)
      const verifiedUser = await getCookie("verified_user")

      data?.delete_pin !== DeletePin.NoPin && !owner && (!verifiedUser || verifiedUser !== "true") ? setPasswordRequired(true) : setPasswordRequired(false)

    } catch (error) {
      alert(`${error}`)
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

  const handleBlukDownload = async () => {
    if (photos.length === 0) return

    try {
      setIsDownloading(true)
      await Promise.all(selectedPhotos.map(async (url, idx) => {
        await handleDownload(url, idx)
      }))
    } catch (error) {
      console.error("Failed to download photos:", error)
      alert("Failed to download photos.")
    } finally {
      setIsDownloading(false)
    }
  }


  const handleDeleteRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const delete_pin = e.currentTarget !== null ? (e.currentTarget?.elements[0] as HTMLInputElement).value : DeletePin.NoPin


    if (room?.delete_pin !== DeletePin.NoPin && !delete_pin) {
      alert("Please enter the delete pin.")
      return
    }

    try {
      let finalPin: string | null = null
      if (room?.delete_pin !== DeletePin.NoPin) {
        finalPin = delete_pin.trim()
      } else {
        finalPin = DeletePin.NoPin
      }
      const res = await fetch(`/api/room/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delete_pin: finalPin }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
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
    <div className="max-w-9xl min-w-screen mx-auto px-4 py-8 text-neutral-900">
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

      {passwordRequired && <PasswordPupUp roomId={room?.id || ""} setPasswordRequired={setPasswordRequired} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Room: {room?.name || "No room found"}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Share ID with friends:{" "}
            <span className="font-mono text-xs bg-neutral-100 text-neutral-800 border border-neutral-300 px-2 py-0.5 rounded">
              {room?.id || "No room found"}
            </span>
          </p>
          <button className="block bg-gray-800 text-white border border-gray-400 font-mono rounded-sm"
            onClick={() => setShowQRCode(!showQRCode)}>
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
                d="M3.75 4.5A1.5 1.5 0 0 1 5.25 3h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.25 9h-3a1.5 1.5 0 0 1-1.5-1.5v-3ZM3.75 16.5A1.5 1.5 0 0 1 5.25 15h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.25 21h-3a1.5 1.5 0 0 1-1.5-1.5v-3ZM15.75 4.5A1.5 1.5 0 0 1 17.25 3h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 20.25 9h-3a1.5 1.5 0 0 1-1.5-1.5v-3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15h.008v.008H15V15Zm3 0h.008v.008H18V15Zm-3 3h.008v.008H15V18Zm3 3h.008v.008H18V21Zm3-3h.008v.008H21V18Zm0-3h.008v.008H21V15Zm-6 6h.008v.008H15V21Z"
              />
            </svg>View QR Code</button>
          {
            showQRCode && (
              <div className="fixed inset-1 z-40 bg-gray-900/5 flex items-center justify-center backdrop-blur-sm"
                onClick={() => setShowQRCode(false)}>
                <div className="bg-white m-4 p-6  border border-neutral-200"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                      Scan QR Code to join room
                    </label>
                    <button className=" text-neutral-500 hover:text-neutral-900"
                      onClick={() => setShowQRCode(false)}>
                      &times;
                    </button>
                  </div>
                  <QRCodeSVG value={roomUrl} size={200}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                    level="M" />
                </div>
              </div>
            )
          }
          {roomOwner && <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded"
            onClick={() => {
              if (room?.delete_pin !== DeletePin.NoPin) {
                setDeleteRoomPopup(true)
              } else {
                if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
                  handleDeleteRoom(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
                }
              }

            }}>Delete Room</button>}
          <CreateFolderSystem roomId={roomId} folderState={folderState} fetchRoom={fetchRoom} />
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
                disabled={downloadAsZip ? (selectedPhotos.length <= 1 || isZipping) : (selectedPhotos.length < 1 || isDownloading)}
                onClick={() => {
                  if (downloadAsZip) {
                    handleDownloadZip()
                  } else {
                    handleBlukDownload()
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
              >
                {downloadAsZip ? (isZipping
                  ? "Zipping..."
                  : `Download ZIP (${selectedPhotos.length})`) : (isDownloading
                    ? "Downloading..."
                    : `Download (${selectedPhotos.length})`)}
              </button>
              <input type="checkbox" checked={downloadAsZip} onChange={() => setDownloadAsZip(!downloadAsZip)}></input>
            </>
          )}
          {roomId && (
            <div className="shrink-0">
              <UploadButton
                input={{ roomId, folderId: folderState.currentFolder?.id || null }}
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

      <FoldersContainer room={room as RoomData} 
      folderState={folderState as FolderStructure} 
      setFolderState={setFolderState}></FoldersContainer>
      
      {!loading && photos.length === 0 && (
        <div className="border border-dashed border-neutral-300 rounded py-12 text-center">
          <p className="text-neutral-500 text-sm">No photos in this room yet.</p>
        </div>
      )}

      <PhotoContainer photos={photos} setPhotos={setPhotos} roomId={roomId} 
      selectedPhotos={selectedPhotos} selectMultipleImages={selectMultipleImages} 
      selectMultiple={selectMultiple} handleDownload={handleDownload}></PhotoContainer>

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
                name="delete_pin_for_room"
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
