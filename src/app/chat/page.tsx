"use client"
import { useEffect, useState, useRef, Suspense } from "react"
import type React from "react"

import { useSearchParams } from "next/navigation"
import socket from "@/lib/sockets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, ImageIcon, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Message {
  username: string
  text: string
  image?: string
  timestamp?: string
}

function ChatContent() {
  const searchParams = useSearchParams()
  const username = searchParams.get("username") || "Guest"
  const room = searchParams.get("room") || "global"

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect (() =>  {
    socket.emit("join room", room)

    fetch(`https://chat-backend-test-wbsa.onrender.com/messages?room=${room}`)
    // fetch(`http://localhost:3001/messages?room=${room}`)
    .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Fetch error", err))


    socket.on("chat message", (msg: Message) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.off("chat message")
    }
  }, [room])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (input || image) {
      socket.emit("chat message", {
        username,
        text: input,
        image: image || null,
        roomCode: room, // ✅ THIS IS CRITICAL
      });
      
      setInput("")
      setImage(null)
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-700 p-4 md:p-6 lg:p-8">
      <Card className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] border-0 rounded-xl bg-white/95 shadow-xl">
        <CardHeader className="border-b bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm">Back</span>
            </Link>
            <CardTitle className="text-xl font-bold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
              {room === "global" ? "Global Chat" : `Room: ${room}`}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>You: {username}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-center">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.username === username ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                    msg.username === username
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span
                      className={`font-medium text-sm ${msg.username === username ? "text-purple-100" : "text-purple-600"}`}
                    >
                      {msg.username === username ? "You" : msg.username}
                    </span>
                    {msg.timestamp && (
                      <span
                        className={`text-xs ml-2 ${msg.username === username ? "text-purple-200" : "text-gray-400"}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {msg.text && <p className="break-words">{msg.text}</p>}

                  {msg.image && (
                    <div className="mt-2 rounded overflow-hidden">
                      <img
                        src={msg.image || "/placeholder.svg"}
                        alt="Shared image"
                        className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-6 border-t bg-gray-50">
          {image && (
            <div className="mb-2 relative inline-block">
              <img src={image || "/placeholder.svg"} alt="Upload preview" className="h-20 rounded border" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <Button
              variant="outline"
              size="icon"
              onClick={triggerFileInput}
              className="shrink-0"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="h-4 w-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-500" />
              )}
            </Button>

            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />

            <Button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!input && !image}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-700 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
