import { useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { useRouter } from "next/navigation";
import {setCookie} from "cookies-next"


const setCookieFuntion = async () => {
    await setCookie("verified_user", "true", { secure: true, path: "/",sameSite:"lax", maxAge: 1800 })
}

function PasswordPupUp({ roomId, setPasswordRequired }: { roomId: string, setPasswordRequired: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const password = (e.currentTarget.elements[0] as HTMLInputElement).value;
        setLoading(true)
        try {

            const respone = await fetch(`/api/room/${roomId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    delete_pin: password
                })
            })

            if (respone.status !== 200) {
                setPasswordRequired(true)
                alert("Incorrect password. Please try again.")
                return
            }
            const data = await respone.json()
            if (data.success) {

                await setCookieFuntion()
                setPasswordRequired(false)
            }
        } catch (error) {
            console.error("Error submitting password:", error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {loading && <LoadingScreen message="Verifying Password..."
                subtext="Please wait while we verify the password for the room"
                fullScreen={true} />}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
                <div className="bg-white p-6 rounded shadow-lg w-80">
                    <h2 className="text-lg font-semibold mb-4">Enter Password</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button"
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
                                onClick={() => {
                                    router.push('/')
                                }}>
                                Cancel
                            </button>
                            <button type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                                disabled={loading}>
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PasswordPupUp