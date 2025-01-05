'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchChats } from './api'
import { Chat } from './types'
import ChatList from './ChatList'
import Navigation from './Navigation'

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(1)
  const router = useRouter()

  useEffect(() => {
    loadMoreChats()
  }, [])

  const loadMoreChats = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const newChats = await fetchChats(pageRef.current)
      if (newChats.length === 0) {
        setHasMore(false)
      } else {
        setChats(prevChats => [...prevChats, ...newChats])
        pageRef.current += 1
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load chats. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-20">
      <motion.header
        className="bg-gray-800 shadow-lg p-4 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-cyan-400 text-center">Chats</h1>
      </motion.header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <ChatList chats={chats} onChatClick={(username) => router.push(`/chat/${username}`)} />
        
        {hasMore && (
          <Button
            onClick={loadMoreChats}
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </main>

      <Navigation currentPage="chats" />

      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  )
}
