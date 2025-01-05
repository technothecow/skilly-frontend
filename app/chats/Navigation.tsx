import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Home, Search, MessageCircle, Settings } from 'lucide-react'

interface NavigationProps {
  currentPage: 'home' | 'search' | 'chats' | 'settings'
}

export default function Navigation({ currentPage }: NavigationProps) {
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <div className="max-w-md mx-auto flex justify-around items-center p-2">
        <Button 
          variant="ghost" 
          className={`flex-col items-center ${currentPage === 'home' ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`} 
          onClick={() => router.push('/home')}
        >
          <Home className="h-6 w-6" />
          <span className="sr-only">Home</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col items-center ${currentPage === 'search' ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`} 
          onClick={() => router.push('/search')}
        >
          <Search className="h-6 w-6" />
          <span className="sr-only">Search</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col items-center ${currentPage === 'chats' ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`} 
          onClick={() => router.push('/chats')}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chats</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col items-center ${currentPage === 'settings' ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`} 
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-6 w-6" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </nav>
  )
}
