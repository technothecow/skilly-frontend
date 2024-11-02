"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import confetti from 'canvas-confetti'
import { ChevronRight, ChevronLeft, Camera, Loader2 } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'

interface Category {
  categories: string[];
}

export default function FillProfile() {
  const [categories, setCategories] = useState<string[]>([])
  const [learnCategories, setLearnCategories] = useState<string[]>([])
  const [teachCategories, setTeachCategories] = useState<string[]>([])
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [currentPanel, setCurrentPanel] = useState(0)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [isProfileSubmitted, setIsProfileSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkProfileStatus()
  }, [])

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.is_registered) {
          router.push('/profile/settings')
        } else {
          fetchCategories()
        }
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to check profile status')
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
      toast.error((error as Error).message || 'Failed to check profile status. Please try again later.')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [username])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/categories/list`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data: Category = await response.json()
        setCategories(data.categories)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error((error as Error).message || 'Failed to load categories. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const checkUsername = async () => {
    setIsCheckingUsername(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      })
      if (response.status === 200) {
        setIsUsernameAvailable(true)
      } else if (response.status === 409) {
        setIsUsernameAvailable(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to check username availability')
      }
    } catch (error) {
      console.error('Error checking username:', error)
      toast.error((error as Error).message || 'Failed to check username availability. Please try again.')
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setIsAvatarDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (croppedArea: Area, croppedAreaPixels: Area) => {
    try {
      const croppedImage = await getCroppedImg(image!, croppedAreaPixels)
      setCroppedImage(croppedImage)
      setIsAvatarDialogOpen(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    }
  }

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<string> => {
    const image = new Image()
    image.src = imageSrc
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  const validateForm = () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return false
    }
    if (!isUsernameAvailable) {
      setError('This username is already taken')
      return false
    }
    if (!name.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          display_name: name,
          teach_categories: teachCategories,
          learn_categories: learnCategories,
          description,
        })
      })

      if (response.ok) {
        setIsProfileSubmitted(true)
        toast.success('Profile information submitted successfully!')
        setCurrentPanel(3) // Move to the image upload panel
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit profile')
      }
    } catch (error) {
      console.error('Error submitting profile:', error)
      toast.error((error as Error).message || 'Failed to submit profile. Please try again.')
    }
  }

  const uploadProfilePicture = async () => {
    if (!croppedImage) {
      toast.error('Please select and crop an image before uploading.')
      return
    }

    try {
      const blob = await fetch(croppedImage).then(r => r.blob())
      const formData = new FormData()
      formData.append('picture', blob, 'profile.jpg')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('Profile picture uploaded successfully!')
        router.push('/home')
      } else {
        throw new Error('Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture. Please try again.')
    }
  }

  const renderPanel = () => {
    switch (currentPanel) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-cyan-400">What do you want to learn?</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <motion.button
                  key={`learn-${category}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLearnCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                  className={`p-4 text-left rounded-lg transition-all ${
                    learnCategories.includes(category)
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-cyan-400">What can you teach?</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <motion.button
                  key={`teach-${category}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTeachCategories(prev =>
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                  className={`p-4 text-left rounded-lg transition-all ${
                    teachCategories.includes(category)
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-cyan-400">Create Your Profile</h2>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username (cannot be changed later)</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.slice(0, 20))
                    setIsUsernameAvailable(true) // Reset availability on change
                  }}
                  onBlur={checkUsername}
                  placeholder="Choose a unique username"
                  maxLength={20}
                  className="bg-gray-800 text-white border-gray-700 focus:border-cyan-500"
                />
                {isCheckingUsername && (
                  <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-cyan-500" />
                )}
                {!isCheckingUsername && username && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute right-2 top-2 h-5 w-5 rounded-full ${isUsernameAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                )}
              </div>
              {!isUsernameAvailable && (
                <p className="text-red-500 text-sm">This username is already taken</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Enter your display name"
                maxLength={20}
                
                className="bg-gray-800 text-white border-gray-700 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">About You</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Tell us about yourself"
                rows={4}
                maxLength={500}
                className="bg-gray-800 text-white border-gray-700 focus:border-cyan-500"
              />
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-cyan-400">Upload Profile Picture (Optional)</h2>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-300">Profile Picture</Label>
              <div className="flex flex-col items-center space-y-4">
                {croppedImage ? (
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    src={croppedImage}
                    alt="Cropped profile"
                    className="w-64 h-64 object-cover rounded-lg"
                  />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-64 h-64 bg-gray-700 flex items-center justify-center cursor-pointer rounded-lg"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Camera className="w-12 h-12 text-cyan-400" />
                  </motion.div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {croppedImage ? 'Change Picture' : 'Upload Picture'}
                </Button>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <AnimatePresence mode="wait">
          {renderPanel()}
        </AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex justify-between"
        >
          {currentPanel > 0 && currentPanel < 3 && (
            <Button
              onClick={() => setCurrentPanel(currentPanel - 1)}
              variant="outline"
              className="bg-gray-700 text-cyan-400 hover:bg-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          {currentPanel < 2 ? (
            <Button
              onClick={() => setCurrentPanel(currentPanel + 1)}
              className="ml-auto bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : currentPanel === 2 ? (
            <Button
              onClick={handleSubmit}
              className="ml-auto bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={!isUsernameAvailable}
            >
              Submit Profile
            </Button>
          ) : (
            <div className="flex justify-end space-x-2 w-full">
              <Button
                onClick={() => router.push('/home')}
                variant="outline"
                className="bg-gray-700 text-cyan-400 hover:bg-gray-600"
              >
                Skip
              </Button>
              <Button
                onClick={uploadProfilePicture}
                disabled={!croppedImage}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Upload Picture & Finish
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Crop Avatar</DialogTitle>
            <DialogDescription className="text-gray-300">
              Drag to reposition. Use pinch gesture or mouse wheel to zoom.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[300px] relative">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, croppedAreaPixels) => {
                setCroppedAreaPixels(croppedAreaPixels)
              }}
            />
          </div>
          <Button
            onClick={() => handleCropComplete(crop, croppedAreaPixels!)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Apply
          </Button>
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  )
}