"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendMessage, getMessages } from "@/features/messages/actions/messages"
import { Loader2, Send, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
    id: string
    content: string
    createdAt: Date
    senderId: string
    sender: {
        name: string | null
        imageUrl: string | null
    }
}

interface ChatInterfaceProps {
    dealId: string
    currentUserId: string
}

export function ChatInterface({ dealId, currentUserId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const msgs = await getMessages(dealId)
                // Only update if different count to avoid jitter (simple check)
                // ideally we check IDs but for MVP this is okay
                setMessages(msgs as Message[])
            } catch (error) {
                console.error("Error fetching messages", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 3000) // Poll every 3s
        return () => clearInterval(interval)
    }, [dealId])

    // Auto-scroll to bottom on new messages
    // useEffect(() => {
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    //     }
    // }, [messages])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || isSending) return

        const msgContent = newMessage
        setNewMessage("") // Optimistic clear
        setIsSending(true)

        try {
            const result = await sendMessage(dealId, msgContent)
            if (result.success) {
                // Fetch immediately to show update
                const msgs = await getMessages(dealId)
                setMessages(msgs as Message[])
            } else {
                toast.error(result.message)
                setNewMessage(msgContent) // Restore text on error
            }
        } catch {
            toast.error("Failed to send message")
            setNewMessage(msgContent)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="py-4 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Deal Chat
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Message List */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                            <p>No messages yet.</p>
                            <p>Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    {!isMe && (
                                        <Avatar className="w-8 h-8 mt-1">
                                            <AvatarImage src={msg.sender.imageUrl || undefined} />
                                            <AvatarFallback>{msg.sender.name?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-gray-50">
                    <form
                        onSubmit={handleSend}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="bg-white"
                            disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
