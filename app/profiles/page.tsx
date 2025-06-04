"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, User, Trash2, Settings, LogIn, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  age: number
  height: number
  weight: number
  email: string
  goal: "cut" | "bulk" | "maintenance"
  targetCalories: number
  waterIntake: number
  createdAt: string
  lastActive: string
}

export default function ProfilesManager() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null)
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    const profilesStr = localStorage.getItem("allProfiles")
    const currentProfile = localStorage.getItem("userProfile")

    if (profilesStr) {
      const allProfiles = JSON.parse(profilesStr)
      setProfiles(allProfiles)
    }

    if (currentProfile) {
      const current = JSON.parse(currentProfile)
      setCurrentProfileId(current.id)
    }
  }

  const switchProfile = (profile: UserProfile) => {
    // Update current profile
    localStorage.setItem("userProfile", JSON.stringify(profile))

    // Update last active timestamp
    const updatedProfiles = profiles.map((p) =>
      p.id === profile.id ? { ...p, lastActive: new Date().toISOString() } : p,
    )
    localStorage.setItem("allProfiles", JSON.stringify(updatedProfiles))

    setCurrentProfileId(profile.id)

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const confirmDeleteProfile = (profileId: string) => {
    setProfileToDelete(profileId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProfile = () => {
    if (!profileToDelete) return

    const updatedProfiles = profiles.filter((p) => p.id !== profileToDelete)
    setProfiles(updatedProfiles)
    localStorage.setItem("allProfiles", JSON.stringify(updatedProfiles))

    // If deleting current profile, clear current profile data
    if (profileToDelete === currentProfileId) {
      localStorage.removeItem("userProfile")
      localStorage.removeItem("dailyData")
      localStorage.removeItem("habits")
      setCurrentProfileId(null)
    }

    // Delete profile-specific data
    localStorage.removeItem(`dailyData_${profileToDelete}`)
    localStorage.removeItem(`habits_${profileToDelete}`)

    // Close dialog and reset state
    setIsDeleteDialogOpen(false)
    setProfileToDelete(null)
  }

  const createNewProfile = () => {
    router.push("/profiles/create")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getGoalBadgeColor = (goal: string) => {
    switch (goal) {
      case "cut":
        return "bg-red-100 text-red-700"
      case "bulk":
        return "bg-green-100 text-green-700"
      case "maintenance":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Profile Manager
          </h1>
          <p className="text-gray-600">Manage your fitness profiles and switch between them</p>
        </div>

        {/* Current Profile Indicator */}
        {currentProfileId && (
          <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 bg-white/20">
                    <AvatarFallback className="text-indigo-600 font-bold">
                      {getInitials(profiles.find((p) => p.id === currentProfileId)?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">Currently Active Profile</h3>
                    <p className="text-indigo-100">{profiles.find((p) => p.id === currentProfileId)?.name}</p>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Profile Button */}
        <div className="mb-6">
          <Button
            onClick={createNewProfile}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Profile
          </Button>
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Profiles Found</h3>
              <p className="text-gray-500 mb-6">Create your first profile to start tracking your fitness journey</p>
              <Button
                onClick={createNewProfile}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  profile.id === currentProfileId ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600">
                        <AvatarFallback className="text-white font-bold">{getInitials(profile.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {profile.age} years • {profile.height}cm • {profile.weight}kg
                        </CardDescription>
                      </div>
                    </div>
                    {profile.id === currentProfileId && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Goal and Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Goal:</span>
                      <Badge className={getGoalBadgeColor(profile.goal)}>
                        {profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Target Calories:</span>
                      <span className="text-sm font-medium">{profile.targetCalories} kcal</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Water Goal:</span>
                      <span className="text-sm font-medium">{profile.waterIntake}L</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Created: {formatDate(profile.createdAt)}
                    </div>
                    {profile.lastActive && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        Last active: {formatDate(profile.lastActive)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {profile.id !== currentProfileId ? (
                      <Button
                        onClick={() => switchProfile(profile)}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Switch
                      </Button>
                    ) : (
                      <Link href="/dashboard" className="flex-1">
                        <Button
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Dashboard
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => confirmDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this profile? This action cannot be undone and will permanently delete
                all associated data including daily logs, habits, and progress history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProfile} className="bg-red-600 hover:bg-red-700">
                Delete Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Quick Stats */}
        {profiles.length > 0 && (
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profiles.length}</div>
                  <div className="text-sm text-blue-700">Total Profiles</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {profiles.filter((p) => p.goal === "bulk").length}
                  </div>
                  <div className="text-sm text-green-700">Bulking Goals</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {profiles.filter((p) => p.goal === "cut").length}
                  </div>
                  <div className="text-sm text-red-700">Cutting Goals</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {profiles.filter((p) => p.goal === "maintenance").length}
                  </div>
                  <div className="text-sm text-purple-700">Maintenance Goals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
