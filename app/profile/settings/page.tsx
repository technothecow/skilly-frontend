"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ArrowLeft, Camera } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'

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

export default function ProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettings>({
    username: '',
    display_name: '',
    email: '',
    description: '',
    are_notifications_enabled: true,
    is_public: true,
    learn_categories: [],
    teach_categories: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

  useEffect(() => {
    fetchProfileSettings()
    fetchCategories()
  }, [])

  const fetchProfileSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        // Fetch the profile picture separately
        const pictureResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture/${data.username}`, {
          credentials: 'include',
        })
        if (pictureResponse.ok) {
          const pictureBlob = await pictureResponse.blob()
          const pictureUrl = URL.createObjectURL(pictureBlob)
          setImage(pictureUrl)
          setCroppedImage(pictureUrl)
        } else {
          console.error('Failed to fetch profile picture')
        }
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch profile settings')
      }
    } catch (error) {
      console.error('Error fetching profile settings:', error)
      toast.error((error as Error).message || 'Failed to load profile settings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/categories/list`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updatedSettings = {
        ...settings,
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedSettings),
      })
      if (response.ok) {
        if (croppedImage && croppedImage !== image) {
          await uploadProfilePicture(croppedImage)
        }
        toast.success('Profile settings updated successfully!')
        setSettings(updatedSettings)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile settings')
      }
    } catch (error) {
      console.error('Error updating profile settings:', error)
      toast.error((error as Error).message || 'Failed to update profile settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadProfilePicture = async (croppedImg: string) => {
    const blob = await fetch(croppedImg).then(r => r.blob())
    const formData = new FormData()
    formData.append('picture', blob, 'profile.jpg')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile/picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture. Please try again.')
    }
  }

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
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

  const handleChangeAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profile`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        toast.success('Account deleted successfully')
        const data = await response.json()
        router.push(data.redirect)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error((error as Error).message || 'Failed to delete account. Please try again.')
    }
  }

  const toggleCategory = (category: string, type: 'learn' | 'teach') => {
    setSettings(prev => {
      const key = `${type}_categories` as keyof ProfileSettings
      const currentCategories = prev[key] as string[]
      const updatedCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category]
      return { ...prev, [key]: updatedCategories }
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (image) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels)
        setCroppedImage(croppedImage)
      }
      setIsAvatarDialogOpen(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-4">
      <Card className="max-w-2xl mx-auto relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-4"
          onClick={() => router.push('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
        </Button>
        <CardHeader className="pt-16">
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={croppedImage || undefined} />
                <AvatarFallback>{settings.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button variant="outline" type="button" onClick={handleChangeAvatarClick}>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username (unchangeable)</Label>
              <Input
                id="username"
                value={settings.username}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_name">Public Name</Label>
              <Input
                id="public_name"
                value={settings.display_name}
                onChange={(e) => setSettings(prev => ({ ...prev, display_name: e.target.value.slice(0, 20) }))}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value.slice(0, 50) }))}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value.slice(0, 500) }))}
                rows={4}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label>Categories you want to learn</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={`learn-${category}`}
                    type="button"
                    variant={settings.learn_categories.includes(category) ? "default" : "outline"}
                    onClick={() => toggleCategory(category, 'learn')}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categories you can teach</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={`teach-${category}`}
                    type="button"
                    variant={settings.teach_categories.includes(category) ? "default" : "outline"}
                    onClick={() => toggleCategory(category, 'teach')}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={settings.are_notifications_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, are_notifications_enabled: checked }))}
              />
              <Label htmlFor="notifications">Enable email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public-profile"
                checked={settings.is_public}
                onCheckedChange={(checked) => setSettings(prev =>   ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="public-profile">Make profile public</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </form>
      </Card>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
            <DialogDescription>
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
              onCropComplete={onCropComplete}
            />
          </div>
          <Button onClick={() => handleCropComplete(crop, croppedAreaPixels!)}>
            Apply
          </Button>
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-center" />
    </div>
  )
}