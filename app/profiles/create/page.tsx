"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Target, Droplets } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  age: number
  height: number
  weight: number
  email: string
  password: string
  goal: "cut" | "bulk" | "maintenance"
  activityLevel: string
  targetCalories: number
  waterIntake: number
  createdAt: string
  lastActive: string
}

export default function CreateProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<
    Omit<UserProfile, "id" | "targetCalories" | "waterIntake" | "createdAt" | "lastActive">
  >({
    name: "",
    age: 0,
    height: 0,
    weight: 0,
    email: "",
    password: "",
    goal: "maintenance",
    activityLevel: "moderate",
  })

  const calculateCalories = () => {
    // Harris-Benedict Equation for BMR
    const bmr = 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }

    const tdee = bmr * activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers]

    // Goal adjustments
    let targetCalories = tdee
    if (profile.goal === "cut") targetCalories = tdee - 500
    if (profile.goal === "bulk") targetCalories = tdee + 500

    return Math.round(targetCalories)
  }

  const calculateWaterIntake = () => {
    // Basic water intake: 35ml per kg of body weight
    return Math.round(((profile.weight * 35) / 1000) * 10) / 10 // in liters
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const targetCalories = calculateCalories()
    const waterIntake = calculateWaterIntake()
    const profileId = Date.now().toString()

    const completeProfile: UserProfile = {
      ...profile,
      id: profileId,
      targetCalories,
      waterIntake,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }

    // Get existing profiles
    const existingProfilesStr = localStorage.getItem("allProfiles")
    const existingProfiles = existingProfilesStr ? JSON.parse(existingProfilesStr) : []

    // Add new profile
    const updatedProfiles = [...existingProfiles, completeProfile]
    localStorage.setItem("allProfiles", JSON.stringify(updatedProfiles))

    // Set as current profile
    localStorage.setItem("userProfile", JSON.stringify(completeProfile))

    // Initialize daily data structure for this profile
    const today = new Date().toISOString().split("T")[0]
    const dailyData = {
      [today]: {
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterDrunk: 0,
        habits: {
          positive: [],
          negative: [],
        },
        habitsCompleted: {
          positive: [],
          negative: [],
        },
        streak: 0,
        foods: [],
        exercises: [],
      },
    }

    // Store profile-specific data
    localStorage.setItem("dailyData", JSON.stringify(dailyData))
    localStorage.setItem(`dailyData_${profileId}`, JSON.stringify(dailyData))
    localStorage.setItem("habits", JSON.stringify({ positive: [], negative: [] }))
    localStorage.setItem(`habits_${profileId}`, JSON.stringify({ positive: [], negative: [] }))

    // Send welcome email
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "welcome_email",
          email: completeProfile.email,
          name: completeProfile.name,
          data: {
            age: completeProfile.age,
            height: completeProfile.height,
            weight: completeProfile.weight,
            goal: completeProfile.goal,
            targetCalories: completeProfile.targetCalories,
            waterIntake: completeProfile.waterIntake,
          },
        }),
      })
    } catch (error) {
      console.error("Failed to send welcome email:", error)
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profiles">
            <Button variant="outline" size="icon" className="hover:bg-blue-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Profile</h1>
            <p className="text-gray-600">Set up a new fitness tracking profile</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Profile Setup
            </CardTitle>
            <CardDescription>Tell us about yourself to get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) })}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ""}
                    onChange={(e) => setProfile({ ...profile, height: Number.parseInt(e.target.value) })}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: Number.parseInt(e.target.value) })}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fitness Goal</Label>
                  <Select
                    value={profile.goal}
                    onValueChange={(value: "cut" | "bulk" | "maintenance") => setProfile({ ...profile, goal: value })}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cut">Cut (Lose Weight)</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="bulk">Bulk (Gain Weight)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select
                    value={profile.activityLevel}
                    onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="veryActive">Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {profile.weight > 0 && profile.height > 0 && profile.age > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Target Calories</p>
                      <p className="text-lg font-semibold text-blue-600">{calculateCalories()} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Water Intake</p>
                      <p className="text-lg font-semibold text-blue-600">{calculateWaterIntake()}L</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/profiles" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Create Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
