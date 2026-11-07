"use client"

import { useState, useEffect } from "react"
import Pusher from "pusher-js"
import { Message } from "../_types/customTypes"


interface ChatSystemProps {
    roomId: string
}

const ChatSystem = (ChatSystemProps: ChatSystemProps) => {
    const { roomId } = ChatSystemProps
    const [openMessagePanel, setOpenMessagePanel] = useState(false)
    const [userIdentity, setUserIdentity] = useState<string | null>(null)

    const EMOJI_OPTIONS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐯", "🐨", "🦉", "🐬"]
    const [myEmoji, setMyEmoji] = useState<string>("👤")
    const [takenEmojis, setTakenEmojis] = useState<string[]>([])
    const [messages, setMessages] = useState<Array<Message>>([])

    useEffect(() => {
        const pusherReciever = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            forceTLS: true
        })
        const channel = pusherReciever.subscribe(`room-${roomId}`)

        channel.bind("emoji:selected", (data: { action: string, selectedEmoji: string }) => {

            console.log(data.selectedEmoji)
            setTakenEmojis(prev => [...prev, data.selectedEmoji])
        })

        channel.bind("message:posted", (data:any) => {

            fetchRoomChats()
        })

        const userIdentityFromSession = sessionStorage.getItem("chatIdentity")
        if (!userIdentityFromSession) {
            const newIdentity = `User-${Math.floor(Math.random() * 10000)}`
            sessionStorage.setItem("chatIdentity", newIdentity)
            setUserIdentity(newIdentity)
        } else {
            setUserIdentity(userIdentityFromSession)
        }

        fetchRoomChats()

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
            pusherReciever.disconnect()
        }
    }, [roomId])

    const fetchRoomChats = async () => {
        try {
            const response = await fetch(`/api/chat/${roomId}`)
            if (response.ok) {
                const data: Message[] = await response.json()
                setMessages(data)
            } else {
                console.error("Failed to fetch room chats")
            }

        } catch (error) {
            console.error("Error fetching room chats:", error)
        }
    }
    const handleSelectEmoji = async (selectedEmoji: string) => {
        if (takenEmojis.includes(selectedEmoji)) {
            alert("This emoji is already taken. Please select another one.")
            return
        }

        const setEmojiInLocal = await sessionStorage.setItem("chatEmoji", selectedEmoji)
        // if (selectedEmoji !== "👤") {

        //     // await pusherServer?.trigger(`room-${roomId}`, "emoji:selected", {
        //     //     action: "one user selected emoji",
        //     //     selectedEmoji: selectedEmoji
        //     // })
        // }
        setMyEmoji(selectedEmoji)
    }

    const handleSendMessage = async (text: string, emoji: string) => {

        if (!userIdentity) {
            alert("User identity not set, Please refresh the page")
            return
        }

        const response = await fetch(`/api/chat/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text,
                senderEmoji: emoji,
                senderIdentity: userIdentity
            })
        })
    }

    return (
        <div>
            {openMessagePanel ? (
                <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-120 max-h-[85vh] bg-white border border-gray-300 rounded-md shadow-sm z-30 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-orange-900">
                                Messages
                            </h3>
                            {myEmoji && (
                                <span className="text-xs bbg-transparent border border-gray-300 px-1.5 py-0.5 rounded-full">
                                    {myEmoji}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpenMessagePanel(false)}
                            className="text-gray-400 hover:text-gray-800 text-lg leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-xs font-mono text-gray-400">
                                    No message
                                </span>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`flex ${message.senderIdentity === userIdentity ? "justify-end" : "items-start"} gap-2`}>
                                    <span className="text-base select-none shrink-0" title={message.senderEmoji}>
                                        {message.senderEmoji}
                                    </span>
                                    <div className="bg-gray-100 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800 wrap-break-words max-w-[80%] font-mono">
                                        {message.text}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-white shrink-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget
                                const input = form.elements.namedItem("message") as HTMLInputElement
                                const text = input.value.trim()

                                if (!myEmoji) {
                                    alert("Please select an avatar emoji before chatting.")
                                    return;
                                }
                                if (!text) return

                                handleSendMessage(text, myEmoji)
                                input.value = ""
                            }}
                            className="flex items-center gap-1.5"
                        >
                            <select
                                value={myEmoji}
                                onChange={(e) => {
                                    const selected = e.target.value

                                    handleSelectEmoji(selected)
                                }}
                                className="w-16 bg-gray-50 border border-gray-300 rounded px-1.5 py-1.5 text-sm text-center focus:outline-none focus:border-gray-900 cursor-pointer shrink-0"
                                title="Select your avatar emoji"
                            >
                                <option value="👤">
                                    👤
                                </option>
                                {EMOJI_OPTIONS.map((emoji) => {
                                    const isTaken = takenEmojis.includes(emoji) && emoji !== myEmoji
                                    const isSelected = emoji === myEmoji

                                    return (
                                        <option
                                            key={emoji}
                                            value={emoji}
                                            // disabled={isTaken}
                                            className={isTaken ? "text-gray-300 bg-gray-100" : "text-gray-900"}
                                        >
                                            {emoji} {/*isSelected ? "(You)" : isTaken ? "(Taken)" : ""*/}
                                        </option>
                                    );
                                })}
                            </select>
                            <input
                                type="text"
                                name="message"
                                placeholder={"Type a message..."}
                                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />

                            <button
                                type="submit"
                                disabled={!myEmoji}
                                className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs uppercase px-3.5 py-1.5 rounded transition-colors shrink-0"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button onClick={() => setOpenMessagePanel(true)} className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 z-30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" height="26px" width="26px" fill="#e8eaed"><path d="M6,14h8V12H6v2Zm0-3H18V9H6v2ZM6,8H18V6H6V8ZM2,22V4Q2,3.17 2.59,2.59T4,2H20q0.83,0 1.41,0.59T22,4V16q0,0.82-0.59,1.41T20,18H6L2,22Zm3.15-6H20V4H4V17.13L5.15,16ZM4,16V4V16Z" /></svg>
                </button>
            )}
        </div>
    )
}

export default ChatSystem