"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { KeyRound, Sparkles, Brain, Users } from 'lucide-react'

export default function SkillyOnePager() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signUp' | 'signIn'>('signUp')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/categories/list`, {
        credentials: 'include'
      })
      if (response.ok) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Error checking login status:', error)
      setIsLoggedIn(false)
    }
  }

  const handleKeyClick = () => {
    if (isLoggedIn) {
      router.push('/home')
    } else {
      setAuthMode('signIn')
      setIsAuthOpen(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = authMode === 'signUp' ? '/v1/sign-up' : '/v1/sign-in'

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok) {
        router.push(data.redirect)
      } else if (data?.message) {
        toast.error(data?.message)
      } else {
        throw new Error('Server error')
      }
    } catch (error) {
      toast.error(`An error occurred while ${authMode === 'signUp' ? 'signing up' : 'signing in'}. Please try again.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <header className="bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-cyan-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Skilly
          </motion.h1>
          <nav>
            <ul className="flex items-center space-x-6 sm:space-x-8">
              <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <a href="#features" className="text-sm sm:text-base text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <a href="#how-it-works" className="text-sm sm:text-base text-gray-300 hover:text-cyan-400 transition-colors">How It Works</a>
              </motion.li>
              <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleKeyClick}
                  className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700"
                >
                  <KeyRound className="h-5 w-5" />
                  <span className="sr-only">Sign In/Up</span>
                </Button>
              </motion.li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
        <motion.section 
          className="text-center mb-20 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 mb-6">Share Skills, Grow Together</h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
            Skilly connects people who want to learn with those who love to teach. Discover new skills, share your expertise, and build a community of lifelong learners.
          </p>
        </motion.section>

        <section id="features" className="grid md:grid-cols-3 gap-8 mb-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-cyan-500 border-2">
              <CardContent className="p-6 sm:p-8">
                <Sparkles className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-cyan-300">Discover Skills</h3>
                <p className="text-sm sm:text-base text-gray-300">Explore a wide range of skills taught by passionate individuals in your community.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-cyan-500 border-2">
              <CardContent className="p-6 sm:p-8">
                <Brain className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-cyan-300">Share Your Expertise</h3>
                <p className="text-sm sm:text-base text-gray-300">Become a mentor and share your knowledge with others who are eager to learn.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gray-800 border-cyan-500 border-2">
              <CardContent className="p-6 sm:p-8">
                <Users className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-cyan-300">Connect & Collaborate</h3>
                <p className="text-sm sm:text-base text-gray-300">Build meaningful connections with like-minded individuals and grow together.</p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <motion.section 
          id="how-it-works" 
          className="text-center mb-20 scroll-mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "Sign up and create your profile",
              "List skills you want to learn or teach",
              "Connect with others in your area",
              "Start learning or teaching"
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
                  {index + 1}
                </div>
                <p className="text-sm sm:text-base text-gray-300">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          id="get-started" 
          className="text-center scroll-mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-6">Ready to Get Started?</h2>
          <Button 
            size="lg" 
            className="text-lg sm:text-xl px-8 sm:px-10 py-3 sm:py-4 bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={() => { setAuthMode('signUp'); setIsAuthOpen(true); }}
          >
            Join Skilly Today
          </Button>
        </motion.section>
      </main>

      <footer className="bg-gray-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center text-sm sm:text-base text-gray-400">
          &copy; 2023 Skilly. All rights reserved.
        </div>
      </footer>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-400">{authMode === 'signUp' ? 'Sign Up for Skilly' : 'Sign In to Skilly'}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {authMode === 'signUp' ? 'Join our community of learners and teachers today!' : 'Welcome back! Please sign in to your account.'}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as 'signUp' | 'signIn')}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="signUp" className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
              <TabsTrigger value="signIn" className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="signUp">
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-cyan-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-cyan-500"
                  />
                </div>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Create Account</Button>
              </form>
            </TabsContent>
            <TabsContent value="signIn">
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-cyan-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label  htmlFor="signin-password" className="text-gray-300">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-cyan-500"
                  />
                </div>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Sign In</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  )
}