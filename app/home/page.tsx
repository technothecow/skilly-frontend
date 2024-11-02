"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Lightbulb, Users, Settings, Calendar, Check, CheckCheck, LogOut } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface HomeData {
  username: string;
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
    datetime: string;
    description: string;
  }[];
  is_maintained: boolean;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("learn")
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
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
        // Redirect to login page on 401 Unauthorized
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
  }

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

  const handleAddToCalendar = (event: { name: string; datetime: string; description: string }) => {
    const startDate = new Date(event.datetime)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Assume 1 hour duration

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchHomeData}>Try Again</Button>
      </div>
    )
  }

  if (!homeData) {
    return <div className="min-h-screen flex items-center justify-center">No data available</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {homeData.username}!</h1>
          <p className="text-gray-600">Ready to learn or teach today?</p>
        </div>
        <Button onClick={() => router.push('/profile/settings')} variant="ghost">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button onClick={handleLogout} variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
        </Button>
      </header>

      {homeData.is_maintained && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          The service is currently under maintenance. Some features may be unavailable.
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="teach">Teach</TabsTrigger>
          </TabsList>
          <TabsContent value="learn">
            <Card>
              <CardHeader>
                <CardTitle>Skills to Learn</CardTitle>
              </CardHeader>
              <CardContent>
                {homeData.learn_categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {homeData.learn_categories.map((skill) => (
                      <Button key={skill} variant="outline" className="justify-start" onClick={() => handleCategoryClick(skill, 'learn')}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        {skill}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills to learn selected yet. Add some in your profile settings!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="teach">
            <Card>
              <CardHeader>
                <CardTitle>Skills to Teach</CardTitle>
              </CardHeader>
              <CardContent>
                {homeData.teach_categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {homeData.teach_categories.map((skill) => (
                      <Button key={skill} variant="outline" className="justify-start" onClick={() => handleCategoryClick(skill, 'teach')}>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        {skill}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills to teach selected yet. Add some in your profile settings!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Connections</h2>
          {homeData.recommended.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {homeData.recommended.map((user) => (
                <Card key={user.username} className="cursor-pointer" onClick={() => handleUserClick(user.username)}>
                  <CardContent className="flex items-center p-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={`data:image/jpeg;base64,${user.photo}`} />
                      <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.display_name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.teach_categories.map((skill) => (
                          <Badge key={`teach-${skill}`} variant="secondary">Teaches: {skill}</Badge>
                        ))}
                        {user.learn_categories.map((skill) => (
                          <Badge key={`learn-${skill}`} variant="outline">Learns: {skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recommended connections at the moment. Check back later!</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Chats</h2>
          <Card>
            <CardContent className="p-0">
              {homeData.chats.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {homeData.chats.map((chat) => (
                    <li key={chat.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleChatClick(chat.id)}>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={`data:image/jpeg;base64,${chat.photo}`} />
                          <AvatarFallback>{chat.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{chat.display_name}</p>
                          <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                        </div>
                        {chat.status === 'unread' && (
                          <span className="inline-block bg-red-500 w-3 h-3 rounded-full"></span>
                        )}
                        {chat.status === 'sent' && (
                          <Check className="text-gray-400 h-4 w-4" />
                        )}
                        {chat.status === 'read' && (
                          <CheckCheck className="text-blue-500 h-4 w-4" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 p-4">No recent chats. Start a conversation with someone!</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <Card>
            <CardContent className="p-0">
              {homeData.events.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {homeData.events.map((event) => (
                    <li key={event.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="cursor-pointer" onClick={() => handleEventClick(event.id)}>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-500">Date: {new Date(event.datetime).toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCalendar(event);
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Add to Calendar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 p-4">No upcoming events. Check back later for new events!</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <ToastContainer position="bottom-center" />
    </div>
  )
}