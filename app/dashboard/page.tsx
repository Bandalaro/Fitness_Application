"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Target,
  Droplets,
  Flame,
  TrendingUp,
  Calendar,
  Apple,
  Dumbbell,
  CheckCircle,
  BarChart3,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { EmailScheduler } from "@/lib/email-scheduler"

interface UserProfile {
  name: string
  targetCalories: number
  waterIntake: number
  goal: string
}

interface DailyData {
  caloriesConsumed: number
  caloriesBurned: number
  waterDrunk: number
  habitsCompleted: {
    positive: string[]
    negative: string[]
  }
  streak: number
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dailyData, setDailyData] = useState<DailyData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [emailScheduler, setEmailScheduler] = useState<EmailScheduler | null>(null)

  useEffect(() => {
    // Check if profile exists
    const userProfile = localStorage.getItem("userProfile")
    if (!userProfile) {
      router.push("/")
      return
    }

    setProfile(JSON.parse(userProfile))

    // Initialize email scheduler
    const scheduler = new EmailScheduler()
    setEmailScheduler(scheduler)

    // Get today's data
    const today = new Date().toISOString().split("T")[0]
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today]) {
        setDailyData(allDailyData[today])
      } else {
        // Initialize today's data
        const newDayData = {
          caloriesConsumed: 0,
          caloriesBurned: 0,
          waterDrunk: 0,
          habitsCompleted: { positive: [], negative: [] },
          streak: 0,
          foods: [],
          exercises: [],
        }
        allDailyData[today] = newDayData
        localStorage.setItem("dailyData", JSON.stringify(allDailyData))
        setDailyData(newDayData)
      }
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)

    // Cleanup function
    return () => {
      clearInterval(timer)
      if (scheduler) {
        scheduler.destroy()
      }
    }
  }, [router])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getCalorieProgress = () => {
    if (!profile || !dailyData) return 0
    return Math.min((dailyData.caloriesConsumed / profile.targetCalories) * 100, 100)
  }

  const getWaterProgress = () => {
    if (!profile || !dailyData) return 0
    return Math.min((dailyData.waterDrunk / profile.waterIntake) * 100, 100)
  }

  const getNetCalories = () => {
    if (!dailyData) return 0
    return dailyData.caloriesConsumed - dailyData.caloriesBurned
  }

  const getHabitsScore = () => {
    if (!dailyData) return 0
    return dailyData.habitsCompleted.positive.length - dailyData.habitsCompleted.negative.length
  }

  if (!profile || !dailyData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {profile.name}! 👋
            </h1>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <Badge className="mt-2 bg-green-100 text-green-700">📧 Email reminders active</Badge>
          </div>
          <Link href="/profiles">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Manage Profiles
            </Button>
          </Link>
        </div>

        {/* Email Schedule Info */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">📧 Email Schedule Active</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="font-semibold">7:00 AM</div>
                  <div className="opacity-90">Morning Tasks</div>
                </div>
                <div>
                  <div className="font-semibold">12:00 PM</div>
                  <div className="opacity-90">Afternoon Check</div>
                </div>
                <div>
                  <div className="font-semibold">8:00 PM</div>
                  <div className="opacity-90">Evening Review</div>
                </div>
                <div>
                  <div className="font-semibold">Every Hour</div>
                  <div className="opacity-90">Water Reminder</div>
                </div>
                <div>
                  <div className="font-semibold">10:00 PM</div>
                  <div className="opacity-90">Daily Report</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Calories</p>
                  <p className="text-2xl font-bold">{dailyData.caloriesConsumed}</p>
                  <p className="text-blue-100 text-xs">of {profile.targetCalories}</p>
                </div>
                <Target className="h-8 w-8 text-blue-200" />
              </div>
              <Progress value={getCalorieProgress()} className="mt-3 bg-blue-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Water</p>
                  <p className="text-2xl font-bold">{dailyData.waterDrunk}L</p>
                  <p className="text-cyan-100 text-xs">of {profile.waterIntake}L</p>
                </div>
                <Droplets className="h-8 w-8 text-cyan-200" />
              </div>
              <Progress value={getWaterProgress()} className="mt-3 bg-cyan-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Burned</p>
                  <p className="text-2xl font-bold">{dailyData.caloriesBurned}</p>
                  <p className="text-orange-100 text-xs">calories</p>
                </div>
                <Flame className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Habits Score</p>
                  <p className="text-2xl font-bold">{getHabitsScore()}</p>
                  <p className="text-green-100 text-xs">points today</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Net Calories & Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Net Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">{getNetCalories()}</p>
                <p className="text-sm text-gray-600">
                  {getNetCalories() > profile.targetCalories ? "Above target" : "Within target"}
                </p>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">
                    Goal:{" "}
                    {profile.goal === "cut"
                      ? "Calorie Deficit"
                      : profile.goal === "bulk"
                        ? "Calorie Surplus"
                        : "Maintenance"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600 mb-2">{dailyData.streak} days</p>
                <p className="text-sm text-gray-600 mb-4">Keep it up!</p>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  🔥 On Fire!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Track your daily activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/food">
                <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300">
                  <Apple className="h-6 w-6" />
                  <span className="text-sm">Log Food</span>
                </Button>
              </Link>

              <Link href="/exercise">
                <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                  <Dumbbell className="h-6 w-6" />
                  <span className="text-sm">Log Exercise</span>
                </Button>
              </Link>

              <Link href="/habits">
                <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm">Track Habits</span>
                </Button>
              </Link>

              <Link href="/statistics">
                <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Stats</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Nutrition</h3>
                <p className="text-sm text-blue-600">{Math.round(getCalorieProgress())}% of daily calories consumed</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
                <h3 className="font-semibold text-cyan-800 mb-2">Hydration</h3>
                <p className="text-sm text-cyan-600">{Math.round(getWaterProgress())}% of daily water intake</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Habits</h3>
                <p className="text-sm text-green-600">
                  {dailyData.habitsCompleted.positive.length + dailyData.habitsCompleted.negative.length} habits tracked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
