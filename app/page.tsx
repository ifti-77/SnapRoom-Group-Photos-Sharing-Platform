import Image from "next/image";
import Link from 'next/link'
import StoredRoom from "./_components/StoredRoom";
import { redirect } from "next/navigation";
import HeaderTicker from "./_components/HeaderTicker";



async function handleJoin(formData: FormData) {
  "use server"
  const roomId = formData.get("roomId") as string;
  if (!roomId || roomId.length !== 6) {
    throw new Error("Invalid Room ID. It must be exactly 6 characters.");
  }
  return redirect(`/room/${roomId}`)
}


export default function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <header className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between max-w-9xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-tight text-lg">SNAPROOM
            <span className=" inline sm:hidden text-[10px] font-mono tracking-widest uppercase  px-1.5 text-neutral-600">
              <br />Portfolio Project
            </span>
          </span>
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest uppercase border border-neutral-300 px-1.5 py-0.5 text-neutral-600">
            Portfolio Project
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <HeaderTicker />
        </div>
      </header>

      <section className="max-w-9xl mx-auto px-6 pt-16 pb-12">
        <div className="max-w-7xl">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              No Logins</span> {" "}<span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Full Resolution</span>
            {" "}<span className="w-2 h-2 rounded-full bg-pink-300 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">24H Lifespan</span>

          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-6">
            FULL-RES GROUP PHOTO DUMPS. ZERO MESSAGING APPS.
          </h1>

          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mb-8">
            Create an ephemeral room in 5 seconds. Friends scan the QR or drop photos
            directly from their mobile browsers. Download the entire album in a single
            ZIP before it vanishes forever.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
            <Link
              href="/room/new/createroom"
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold px-6 py-3 rounded text-center transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              Create a Room &rarr;
            </Link>

            <form action={handleJoin} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-char Room ID"
                name="roomId"
                maxLength={6}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                className="border border-neutral-300 hover:bg-neutral-100 px-4 py-2 text-sm font-medium rounded transition-colors"
              >
                Join
              </button>
            </form>
          </div>

          <div className="mt-3">
            <StoredRoom />
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-4 overflow-hidden">
        <div className="max-w-9xl mx-auto px-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono uppercase text-neutral-500">
              Live Room Simulation / Recent Dump
            </span>
            <span className="text-xs font-mono text-neutral-400">
              4 items • Total: 28.4 MB
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative aspect-4/5 rounded overflow-hidden border border-neutral-300 bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
                alt="Friends laughing"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                IMG_0419.RAW
              </div>
            </div>

            <div className="relative aspect-4/5 rounded overflow-hidden border border-neutral-300 bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                alt="Music performance"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                CONCERT_DUMP.HEIC
              </div>
            </div>

            <div className="relative aspect-4/5 rounded overflow-hidden border border-neutral-300 bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
                alt="Night party"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                FESTIVAL_03.PNG
              </div>
            </div>


            <div className="relative aspect-4/5 rounded overflow-hidden border border-neutral-300 bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Travel scenic"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                YOSEMITE_CAMP.JPG
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-9xl mx-auto px-6 py-20">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-8">
          The Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-200 rounded divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          <div className="p-8">
            <span className="font-mono text-xs text-neutral-400 block mb-3">01 / DISPOSABLE</span>
            <h3 className="text-lg font-bold mb-2">No signups or phone numbers</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Create a room with a 4-digit host PIN. You get a short 6-character room ID
              and an instant QR code. No user accounts, no passwords to forget.
            </p>
          </div>

          <div className="p-8">
            <span className="font-mono text-xs text-neutral-400 block mb-3">02 / UNCOMPRESSED</span>
            <h3 className="text-lg font-bold mb-2">Preserve raw camera clarity</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Messaging apps heavily compress your files. SnapRoom pipes uploads straight
              to high-speed storage without downscaling resolution or stripping colors.
            </p>
          </div>

          <div className="p-8">
            <span className="font-mono text-xs text-neutral-400 block mb-3">03 / BATCH DOWNLOAD</span>
            <h3 className="text-lg font-bold mb-2">One-click ZIP & auto expiration</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Select all pictures or handpick favorites to package into an instant `.zip`
              archive. When you're done, enter your PIN to purge the room immediately.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8 px-6 text-xs text-neutral-500 max-w-9xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <p>SNAPROOM ~ A PLACE FOR YOUR MOMENTS <br />A portfolio project developed by
          {" "} <a href="https://eshraquejabidifti.vercel.app/" target="_blank" rel="noopener noreferrer">
            <span className="font-bold text-emerald-700">Eshraque Jabid Ifti</span>
          </a>
        </p>
        <p>Technology used <br />
          <span className="font-bold text-emerald-700">NEON</span> + {" "}
          <span className="font-bold text-blue-500">POSTGRES</span> + {" "}
          <span className="font-bold text-red-500">UPLOADTHING</span> + {" "}
          <span className="font-bold text-zinc-700">NEXT.JS</span></p>
      </footer>
    </div>
  );
}
