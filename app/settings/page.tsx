"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Home, Search, MessageCircle, Settings, User, Shield, HelpCircle, LogOut } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ProfileSettings {
  username: string;
  display_name: string;
  email: string;
  description: string;
  are_notifications_enabled: boolean;
  is_public: boolean;
  learn_categories: string[];
  teach_categories: string[];
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfileSettings = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        throw new Error('Failed to fetch profile settings')
      }
    } catch (error) {
      console.error('Error fetching profile settings:', error)
      toast.error('Failed to load profile settings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfileSettings()
  }, [fetchProfileSettings])

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
        throw new Error('Failed to logout')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const settingsOptions = [
    { icon: User, label: "Account", onClick: () => router.push('/profile/settings') },
    { icon: Bell, label: "Notifications", onClick: () => console.log("Notifications settings") },
    { icon: Shield, label: "Privacy", onClick: () => console.log("Privacy settings") },
    { icon: HelpCircle, label: "Help & Support", onClick: () => console.log("Help & Support") },
    { icon: LogOut, label: "Logout", onClick: handleLogout },
  ]

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>
  }

  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No settings data available</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto space-y-6"
      >
        <Card className="bg-gray-800 border-cyan-600 cursor-pointer hover:bg-gray-700 transition-colors duration-200" onClick={() => router.push('/profile/settings')}>
          <CardHeader className="flex flex-col items-center justify-center pb-2">
            <Avatar className="h-20 w-20 border-2 border-cyan-500 mb-4">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture/${settings.username}`} />
              <AvatarFallback>{settings.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-xl font-bold text-cyan-400">{settings.display_name}</CardTitle>
              <p className="text-sm text-gray-400">@{settings.username}</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gray-800 border-cyan-600">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-cyan-400">Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {settingsOptions.map((option, index) => (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={option.onClick}
                >
                  <option.icon className="mr-2 h-5 w-5 text-cyan-500" />
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

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
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/chats')}>
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Chats</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-cyan-400" onClick={() => router.push('/settings')}>
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </nav>

      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  )
}