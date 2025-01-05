import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, CheckCheck } from 'lucide-react'
import { Chat } from './types'

interface ChatListProps {
  chats: Chat[]
  onChatClick: (username: string) => void
}

export default function ChatList({ chats, onChatClick }: ChatListProps) {
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
    <AnimatePresence>
      {chats.map((chat) => (
        <motion.div
          key={chat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="bg-gray-800 border-cyan-600 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            onClick={() => onChatClick(chat.username)}
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
  )
}
