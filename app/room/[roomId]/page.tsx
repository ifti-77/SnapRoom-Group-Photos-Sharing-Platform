
import LoadingScreen from "@/app/_components/LoadingScreen";
import SnapRoom from "@/app/_components/SnapRoom";
import { Suspense } from "react";



export default async function page({ params }: { params: Promise<{ roomId: string }> }) {
  

    return (
        <Suspense fallback={<LoadingScreen message="Waiting is not the solution.." 
        subtext="Please wait while the data is being fetched for the room" 
        fullScreen={true} />}>
        <SnapRoom params={params} />
      </Suspense>
    )
}
