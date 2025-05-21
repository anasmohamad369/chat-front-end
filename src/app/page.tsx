"use client"
import { useRouter } from "next/navigation"
import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, ArrowRight } from "lucide-react"

export default function Home() {
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const router = useRouter()

  const handleJoin = () => {
    const finalRoom = roomCode.trim() || "global"
    router.push(`/chat?username=${encodeURIComponent(username.trim())}&room=${encodeURIComponent(finalRoom)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      handleJoin()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-purple-600 to-blue-700">
      <div className="absolute inset-0 bg-[url('/image.png')] opacity-10 bg-repeat" />

      <div className="w-full max-w-md z-10">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare size={32} className="text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome to ChatRoom</CardTitle>
            <CardDescription className="text-center">Enter your details to join a conversation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Your Name
              </label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Enter your display name"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="roomCode" className="text-sm font-medium">
                Room Code
              </label>
              <div className="relative">
                <Input
                  id="roomCode"
                  placeholder="Leave empty for global chat"
                  className="pl-10"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Join an existing room or create a new one</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
              onClick={handleJoin}
              disabled={!username.trim()}
            >
              Join Room
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-white/80 text-sm">
          <p>Connect with friends and start chatting instantly</p>
        </div>
      </div>
    </div>
  )
}
