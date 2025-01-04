"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, MessageCircle, Settings, Check, CheckCheck } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Chat {
  id: string
  last_message: string
  status: 'read' | 'sent' | 'unread' | null
  username: string
  last_action_timestamp: string
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const fetchChats = useCallback(async (page: number) => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/chats?page=${page}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.chats.length === 0) {
          setHasMore(false)
        } else {
          setChats(prevChats => [...prevChats, ...data.chats])
          setCurrentPage(prevPage => prevPage + 1)
        }
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        throw new Error('Failed to fetch chats')
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load chats. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isLoading, router])

  useEffect(() => {
    fetchChats(1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // I have no idea why it needs exactly [] as dependency, but it works

  const handleLoadMore = () => {
    fetchChats(currentPage)
  }

  const handleChatClick = (username: string) => {
    router.push(`/chat/${username}`)
  }

  const getStatusIcon = (status: Chat['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="text-gray-400 h-4 w-4" />
      case 'read':
        return <CheckCheck className="text-cyan-500 h-4 w-4" />
      case 'unread':
        return <div className="bg-cyan-500 w-3 h-3 rounded-full" />
      default:
        return null
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
        <AnimatePresence>
          {chats.map((chat, index) => (
            <motion.div
              key={`${chat.username}-${chat.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="bg-gray-800 border-cyan-600 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                onClick={() => handleChatClick(chat.username)}
              >
                <CardContent className="flex items-center p-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture/${chat.username}`} />
                    <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cyan-300 truncate">{chat.username}</p>
                    <p className="text-xs text-gray-400 truncate">{chat.last_message}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {new Date(chat.last_action_timestamp).toLocaleString()}
                    </span>
                    {getStatusIcon(chat.status)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {hasMore && (
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/home')}>
            <Home className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/search')}>
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-cyan-400" onClick={() => router.push('/chats')}>
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Chats</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/settings')}>
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </nav>

      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  )
}