"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface DailyStats {
  date: string
  caloriesConsumed: number
  caloriesBurned: number
  waterDrunk: number
  habitsScore: number
  streak: number
}

export default function Statistics() {
  const router = useRouter()
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [averages, setAverages] = useState({
    calories: 0,
    water: 0,
    exercise: 0,
    habits: 0,
  })

  useEffect(() => {
    // Check if profile exists
    const userProfile = localStorage.getItem("userProfile")
    if (!userProfile) {
      router.push("/")
      return
    }

    setProfile(JSON.parse(userProfile))
    loadStatistics()
  }, [router])

  const loadStatistics = () => {
    const dailyDataStr = localStorage.getItem("dailyData")
    if (!dailyDataStr) return

    const allDailyData = JSON.parse(dailyDataStr)

    // Get last 7 days of data
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayData = allDailyData[dateStr] || {
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterDrunk: 0,
        habitsCompleted: { positive: [], negative: [] },
        streak: 0,
      }

      const habitsScore = dayData.habitsCompleted.positive.length - dayData.habitsCompleted.negative.length

      last7Days.push({
        date: dateStr,
        caloriesConsumed: dayData.caloriesConsumed,
        caloriesBurned: dayData.caloriesBurned,
        waterDrunk: dayData.waterDrunk,
        habitsScore,
        streak: dayData.streak,
      })
    }

    setWeeklyStats(last7Days)

    // Calculate averages
    const totalDays = last7Days.length
    const avgCalories = last7Days.reduce((sum, day) => sum + day.caloriesConsumed, 0) / totalDays
    const avgWater = last7Days.reduce((sum, day) => sum + day.waterDrunk, 0) / totalDays
    const avgExercise = last7Days.reduce((sum, day) => sum + day.caloriesBurned, 0) / totalDays
    const avgHabits = last7Days.reduce((sum, day) => sum + day.habitsScore, 0) / totalDays

    setAverages({
      calories: Math.round(avgCalories),
      water: Math.round(avgWater * 10) / 10,
      exercise: Math.round(avgExercise),
      habits: Math.round(avgHabits * 10) / 10,
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getCalorieProgress = (consumed: number) => {
    if (!profile) return 0
    return Math.min((consumed / profile.targetCalories) * 100, 100)
  }

  const getWaterProgress = (drunk: number) => {
    if (!profile) return 0
    return Math.min((drunk / profile.waterIntake) * 100, 100)
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="hover:bg-blue-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
            <p className="text-gray-600">Track your progress over time</p>
          </div>
        </div>

        {/* Weekly Averages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Avg Calories</p>
                  <p className="text-2xl font-bold">{averages.calories}</p>
                  <p className="text-blue-100 text-xs">per day</p>
                </div>
                <Target className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Avg Water</p>
                  <p className="text-2xl font-bold">{averages.water}L</p>
                  <p className="text-cyan-100 text-xs">per day</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Exercise</p>
                  <p className="text-2xl font-bold">{averages.exercise}</p>
                  <p className="text-orange-100 text-xs">cal burned</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Habits</p>
                  <p className="text-2xl font-bold">{averages.habits}</p>
                  <p className="text-purple-100 text-xs">score</p>
                </div>
                {averages.habits >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-purple-200" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calories Chart */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Calorie Intake Trend</CardTitle>
              <CardDescription>Daily calorie consumption over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => [`${value} cal`, "Calories"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="caloriesConsumed"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Water Intake Chart */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Water Intake Trend</CardTitle>
              <CardDescription>Daily water consumption over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => [`${value}L`, "Water"]}
                  />
                  <Bar dataKey="waterDrunk" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Exercise and Habits Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Exercise Chart */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Exercise Progress</CardTitle>
              <CardDescription>Calories burned through exercise</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => [`${value} cal`, "Burned"]}
                  />
                  <Bar dataKey="caloriesBurned" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habits Score Chart */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Habits Score Trend</CardTitle>
              <CardDescription>Daily habit completion score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => [`${value}`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="habitsScore"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress Cards */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Weekly Progress Overview
            </CardTitle>
            <CardDescription>Detailed view of each day's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((day, index) => (
                <div key={day.date} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {formatDate(day.date)} {index === 6 && <Badge className="ml-2">Today</Badge>}
                    </h3>
                    <Badge variant={day.habitsScore >= 0 ? "default" : "destructive"}>
                      Habits: {day.habitsScore >= 0 ? "+" : ""}
                      {day.habitsScore}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Calories</span>
                        <span>
                          {day.caloriesConsumed}/{profile.targetCalories}
                        </span>
                      </div>
                      <Progress value={getCalorieProgress(day.caloriesConsumed)} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Water</span>
                        <span>
                          {day.waterDrunk}L/{profile.waterIntake}L
                        </span>
                      </div>
                      <Progress value={getWaterProgress(day.waterDrunk)} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Exercise</span>
                        <span>{day.caloriesBurned} cal burned</span>
                      </div>
                      <Progress value={Math.min((day.caloriesBurned / 500) * 100, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
