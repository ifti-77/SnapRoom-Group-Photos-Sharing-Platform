"use client"
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function SnapRoom({ params }: { params: Promise<{ roomId: string }> }) {
  
    const resolvedParams = use(params)
  const roomId = resolvedParams?.roomId
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function fetchPhotos()
    {
        try {
        const result = await fetch(`/api/photos/${roomId}`);
        if (!result.ok) {
          console.error("Failed to fetch photos");
          return;
        }
        const data = await result.json();
        setPhotos(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    
    }
    fetchPhotos();
  }, [roomId]);
  
    return (
    <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Home
            </Link>
        </div>
        <div className="mb-6">
            <p className="text-neutral-400">Share this room ID with your friends to let them join and upload photos:</p>
            <p className="font-mono text-lg text-neutral-200">{roomId}</p>
        </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room: {roomId}</h1>
      </div>

      {loading && <p className="text-neutral-400">Loading photos...</p>}

      {!loading && photos.length === 0 && (
        <p className="text-neutral-500">No photos in this room yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photoUrl) => (
          <div
            key={photoUrl}
            className="relative aspect-square rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900"
          >
            <img
              src={photoUrl}
              alt="Room photo"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition"
              title="Delete photo"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
