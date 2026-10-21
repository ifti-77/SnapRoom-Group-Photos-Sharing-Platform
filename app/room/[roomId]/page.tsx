
import SnapRoom from "@/app/_components/SnapRoom";
import { Suspense } from "react";



export default async function page({ params }: { params: Promise<{ roomId: string }> }) {
  

    return (
        <Suspense fallback={<p className="text-neutral-400">Loading photos...</p>}>
        <SnapRoom params={params} />
      </Suspense>
    )
}
