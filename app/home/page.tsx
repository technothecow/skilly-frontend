"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Lightbulb, Settings, Calendar, Check, CheckCheck, LogOut, Loader2, Home, Search, MessageCircle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface HomeData {
  username: string;
  display_name: string;
  learn_categories: string[];
  teach_categories: string[];
  recommended: {
    display_name: string;
    teach_categories: string[];
    learn_categories: string[];
    username: string;
    photo: string;
  }[];
  chats: {
    id: string;
    display_name: string;
    username: string;
    photo: string;
    last_message: string;
    status: 'sent' | 'read' | 'unread';
  }[];
  events: {
    name: string;
    id: string;
    start_datetime: string;
    end_datetime: string;
    description: string;
  }[];
  is_maintained: boolean;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("learn")
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchHomeData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/home`, {
        credentials: 'include',
        method: 'post'
      })
      if (response.ok) {
        const data: HomeData = await response.json()
        setHomeData(data)
      } else if (response.status === 307) {
        const data = await response.json()
        router.push(data.redirect)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        throw new Error('Failed to fetch home data')
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
      setError('Failed to load home data. Please try again later.')
      toast.error('Failed to load home data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  const handleCategoryClick = (category: string, type: 'learn' | 'teach') => {
    router.push(`/${type}?category=${encodeURIComponent(category)}`)
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/user/${username}`)
  }

  const handleChatClick = (id: string) => {
    router.push(`/chats/${id}`)
  }

  const handleEventClick = (id: string) => {
    router.push(`/event/${id}`)
  }

  const handleAddToCalendar = (event: { name: string; start_datetime: string; end_datetime: string; description: string }) => {
    const startDate = new Date(event.start_datetime)
    const endDate = new Date(event.end_datetime)

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.name}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.name}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/sign-out`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Logged out successfully')
        const data = await response.json()
        router.push(data.redirect)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to logout')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error((error as Error).message || 'Failed to logout. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchHomeData} className="bg-cyan-600 hover:bg-cyan-700">Try Again</Button>
      </div>
    )
  }

  if (!homeData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No data available</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-20">
      <motion.header 
        className="bg-gray-800 shadow-lg p-4 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">Welcome, {homeData.display_name}!</h1>
          <Button onClick={handleLogout} variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-gray-700">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </motion.header>

      {homeData.is_maintained && (
        <motion.div 
          className="max-w-4xl mx-auto my-4 p-4 bg-yellow-900 text-yellow-200 rounded-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          The service is currently under maintenance. Some features may be unavailable.
        </motion.div>
      )}

      <motion.main 
        className="max-w-4xl mx-auto p-4 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gray-800 border-cyan-600">
          <CardHeader>
            <CardTitle className="text-cyan-400">Your Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="learn" className="text-cyan-400 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Learn</TabsTrigger>
                <TabsTrigger value="teach" className="text-cyan-400 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Teach</TabsTrigger>
              </TabsList>
              <TabsContent value="learn">
                {homeData.learn_categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {homeData.learn_categories.map((skill) => (
                      <motion.div key={skill} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-gray-700 text-cyan-300 hover:bg-gray-600 hover:text-cyan-200 border-cyan-600" 
                          onClick={() => handleCategoryClick(skill, 'learn')}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          {skill}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 mt-4">No skills to learn selected yet. Add some in your profile settings!</p>
                )}
              </TabsContent>
              <TabsContent value="teach">
                {homeData.teach_categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {homeData.teach_categories.map((skill) => (
                      <motion.div key={skill} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-gray-700 text-cyan-300 hover:bg-gray-600 hover:text-cyan-200 border-cyan-600" 
                          onClick={() => handleCategoryClick(skill, 'teach')}
                        >
                          <Lightbulb className="mr-2 h-4 w-4" />
                          {skill}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 mt-4">No skills to teach selected yet. Add some in your profile settings!</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-cyan-600">
          <CardHeader>
            <CardTitle className="text-cyan-400">Recommended Connections</CardTitle>
          </CardHeader>
          <CardContent>
            {homeData.recommended.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homeData.recommended.map((user) => (
                  <motion.div key={user.username} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Card className="cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-200 border-cyan-600" onClick={() => handleUserClick(user.username)}>
                      <CardContent className="flex flex-col p-4">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={`data:image/jpeg;base64,${user.photo}`} />
                            <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-cyan-300">{user.display_name}</h3>
                        </div>
                        <div className="space-y-2">
                          {user.teach_categories.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-cyan-400">Teaching: </span>
                              <span className="text-sm text-gray-300">{user.teach_categories.join(', ')}</span>
                            </div>
                          )}
                          {user.learn_categories.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-cyan-400">Learning: </span>
                              <span className="text-sm text-gray-300">{user.learn_categories.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recommended connections at the moment. Check back later!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-cyan-600">
          <CardHeader>
            <CardTitle className="text-cyan-400">Recent Chats</CardTitle>
          </CardHeader>
          <CardContent>
            {homeData.chats.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {homeData.chats.map((chat) => (
                  <motion.li 
                    key={chat.id} 
                    className="py-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200" 
                    onClick={() => handleChatClick(chat.id)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={`data:image/jpeg;base64,${chat.photo}`} />
                        <AvatarFallback>{chat.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cyan-300 truncate">{chat.display_name}</p>
                        <p className="text-sm text-gray-400 truncate">{chat.last_message}</p>
                      </div>
                      {chat.status === 'unread' && (
                        <span className="inline-block bg-cyan-500 w-3 h-3 rounded-full"></span>
                      )}
                      {chat.status === 'sent' && (
                        <Check className="text-gray-400 h-4 w-4" />
                      )}
                      {chat.status === 'read' && (
                        <CheckCheck className="text-cyan-500 h-4 w-4"   />
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No recent chats. Start a conversation with someone!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-cyan-600">
          <CardHeader>
            <CardTitle className="text-cyan-400">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {homeData.events.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {homeData.events.map((event) => (
                  <motion.li 
                    key={event.id} 
                    className="py-4 hover:bg-gray-700 transition-colors duration-200"
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="cursor-pointer" onClick={() => handleEventClick(event.id)}>
                        <h3 className="font-semibold text-cyan-300">{event.name}</h3>
                        <p className="text-sm text-gray-400">
                          Start: {new Date(event.start_datetime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          End: {new Date(event.end_datetime).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-cyan-600 text-white hover:bg-cyan-700 border-cyan-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCalendar(event);
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Add to Calendar
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No upcoming events. Check back later for new events!</p>
            )}
          </CardContent>
        </Card>
      </motion.main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <Button variant="ghost" className="flex-col items-center text-cyan-400" onClick={() => router.push('/home')}>
            <Home className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/search')}>
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/chats')}>
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