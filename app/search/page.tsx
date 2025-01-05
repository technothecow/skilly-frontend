"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, MessageCircle, Settings, Loader2, X } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface SearchResult {
  username: string
  display_name: string
  description: string
  teach_categories: string[]
  learn_categories: string[]
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedTeachCategories, setSelectedTeachCategories] = useState<string[]>(searchParams.get('teach')?.split(',').filter(Boolean) || [])
  const [selectedLearnCategories, setSelectedLearnCategories] = useState<string[]>(searchParams.get('learn')?.split(',').filter(Boolean) || [])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showKnownPeople, setShowKnownPeople] = useState(searchParams.get('known') === 'true')
  
  const teachSelectRef = useRef<HTMLButtonElement>(null)
  const learnSelectRef = useRef<HTMLButtonElement>(null)

  const handleSearch = useCallback(async (resetResults: boolean = true) => {
    if (!username.trim() && selectedTeachCategories.length === 0 && selectedLearnCategories.length === 0) {
      toast.error('Please enter a username or select at least one category')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          teach_categories: selectedTeachCategories,
          learn_categories: selectedLearnCategories,
          show_known_people: showKnownPeople,
          page: resetResults ? 1 : page,
        }),
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (resetResults) {
          setResults(data.users)
          setPage(2)
        } else {
          setResults(prevResults => [...prevResults, ...data.users])
          setPage(prevPage => prevPage + 1)
        }
        setHasMore(data.users.length > 0)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        throw new Error('Failed to search users')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [username, selectedTeachCategories, selectedLearnCategories, showKnownPeople, page, router])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/categories/list`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories)
        } else {
          throw new Error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories. Please try again later.')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (username) params.set('username', username)
    else params.delete('username')
    if (selectedTeachCategories.length) params.set('teach', selectedTeachCategories.join(','))
    else params.delete('teach')
    if (selectedLearnCategories.length) params.set('learn', selectedLearnCategories.join(','))
    else params.delete('learn')
    if (showKnownPeople) params.set('known', 'true')
    else params.delete('known')
    router.replace(`/search?${params.toString()}`)
  }, [username, selectedTeachCategories, selectedLearnCategories, showKnownPeople, router, searchParams])

  useEffect(() => {
    if (username || selectedTeachCategories.length > 0 || selectedLearnCategories.length > 0 || showKnownPeople) {
      handleSearch(true)
    }
  }, []) // This effect runs only once when the component mounts

  const handleLoadMore = () => {
    handleSearch(false)
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const handleCategorySelect = (category: string, type: 'teach' | 'learn') => {
    if (type === 'teach') {
      if (!selectedTeachCategories.includes(category)) {
        setSelectedTeachCategories(prev => [...prev, category])
      }
      if (teachSelectRef.current) {
        teachSelectRef.current.click()
      }
    } else {
      if (!selectedLearnCategories.includes(category)) {
        setSelectedLearnCategories(prev => [...prev, category])
      }
      if (learnSelectRef.current) {
        learnSelectRef.current.click()
      }
    }
  }

  const handleCategoryRemove = (category: string, type: 'teach' | 'learn') => {
    if (type === 'teach') {
      setSelectedTeachCategories(prev => prev.filter(c => c !== category))
    } else {
      setSelectedLearnCategories(prev => prev.filter(c => c !== category))
    }
  }

  const handleReset = () => {
    setUsername('')
    setSelectedTeachCategories([])
    setSelectedLearnCategories([])
    setShowKnownPeople(false)
    setResults([])
    setPage(1)
    setHasMore(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-20">
      <motion.header 
        className="bg-gray-800 shadow-lg p-4 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto space-y-4">
          <Input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 focus:border-cyan-500"
          />
          <div>
            <Select onValueChange={(value) => handleCategorySelect(value, 'teach')}>
              <SelectTrigger ref={teachSelectRef} className="w-full bg-gray-700 text-white border-gray-600 focus:border-cyan-500">
                <SelectValue placeholder="Select teaching categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-gray-600">
                {categories.filter(category => !selectedTeachCategories.includes(category)).map(category => (
                  <SelectItem key={`teach-${category}`} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTeachCategories.map(category => (
                <Badge key={`teach-badge-${category}`} variant="secondary" className="bg-cyan-600/20 text-cyan-400 border border-cyan-600">
                  {category}
                  <button onClick={() => handleCategoryRemove(category, 'teach')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Select onValueChange={(value) => handleCategorySelect(value, 'learn')}>
              <SelectTrigger ref={learnSelectRef} className="w-full bg-gray-700 text-white border-gray-600 focus:border-cyan-500">
                <SelectValue placeholder="Select learning categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-gray-600">
                {categories.filter(category => !selectedLearnCategories.includes(category)).map(category => (
                  <SelectItem key={`learn-${category}`} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedLearnCategories.map(category => (
                <Badge key={`learn-badge-${category}`} variant="secondary" className="bg-gray-700 text-gray-300 border border-gray-600">
                  {category}
                  <button onClick={() => handleCategoryRemove(category, 'learn')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showKnown"
                checked={showKnownPeople}
                onCheckedChange={(checked) => setShowKnownPeople(checked as boolean)}
              />
              <label htmlFor="showKnown" className="text-sm text-gray-300">
                Show known people
              </label>
            </div>
            <Button
              onClick={handleReset}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Reset
            </Button>
          </div>
          <Button 
            onClick={() => handleSearch(true)} 
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </motion.header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <AnimatePresence>
          {results.map((user, index) => (
            <motion.div
              key={`${user.username}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-800 border-cyan-600 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                onClick={() => handleUserClick(user.username)}
              >
                <CardContent className="flex items-start p-4 gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture/${user.username}`} />
                    <AvatarFallback>{user.display_name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cyan-300">{user.display_name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{user.description}</p>
                    {(user.teach_categories.length > 0 || user.learn_categories.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.teach_categories.map(category => (
                          <Badge 
                            key={`teach-${category}`}
                            variant="secondary"
                            className="bg-cyan-600/20 text-cyan-400 border border-cyan-600"
                          >
                            Teaches {category}
                          </Badge>
                        ))}
                        {user.learn_categories.map(category => (
                          <Badge 
                            key={`learn-${category}`}
                            variant="secondary"
                            className="bg-gray-700 text-gray-300 border border-gray-600"
                          >
                            Learns {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {!isLoading && results.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 py-8"
          >
            No users found
          </motion.p>
        )}
        {hasMore && results.length > 0 && (
          <Button 
            onClick={handleLoadMore} 
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load More'}
          </Button>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <Button variant="ghost" className="flex-col items-center text-gray-400 hover:text-cyan-400" onClick={() => router.push('/home')}>
            <Home className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col items-center text-cyan-400" onClick={() => router.push('/search')}>
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
