"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Habit {
  id: string
  name: string
  description: string
  type: "positive" | "negative"
  createdAt: string
}

interface HabitCompletion {
  habitId: string
  date: string
  completed: boolean
}

export default function HabitsTracker() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayCompletions, setTodayCompletions] = useState<HabitCompletion[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    type: "positive" as "positive" | "negative",
  })
  const [habitScore, setHabitScore] = useState(0)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    // Check if profile exists
    const userProfile = localStorage.getItem("userProfile")
    if (!userProfile) {
      router.push("/")
      return
    }

    loadHabits()
    loadTodayCompletions()
  }, [router])

  const loadHabits = () => {
    const habitsStr = localStorage.getItem("habits")
    if (habitsStr) {
      const habitsData = JSON.parse(habitsStr)
      const allHabits = [...habitsData.positive, ...habitsData.negative]
      setHabits(allHabits)
    }
  }

  const loadTodayCompletions = () => {
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today]) {
        const completions: HabitCompletion[] = []

        // Add positive habit completions
        allDailyData[today].habitsCompleted.positive.forEach((habitId: string) => {
          completions.push({ habitId, date: today, completed: true })
        })

        // Add negative habit completions
        allDailyData[today].habitsCompleted.negative.forEach((habitId: string) => {
          completions.push({ habitId, date: today, completed: true })
        })

        setTodayCompletions(completions)

        // Calculate score
        const score =
          allDailyData[today].habitsCompleted.positive.length - allDailyData[today].habitsCompleted.negative.length
        setHabitScore(score)
      }
    }
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      type: newHabit.type,
      createdAt: new Date().toISOString(),
    }

    const updatedHabits = [...habits, habit]
    setHabits(updatedHabits)

    // Update localStorage
    const habitsStr = localStorage.getItem("habits")
    const habitsData = habitsStr ? JSON.parse(habitsStr) : { positive: [], negative: [] }

    if (habit.type === "positive") {
      habitsData.positive.push(habit)
    } else {
      habitsData.negative.push(habit)
    }

    localStorage.setItem("habits", JSON.stringify(habitsData))

    // Reset form
    setNewHabit({ name: "", description: "", type: "positive" })
    setShowAddForm(false)
  }

  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId)
    setHabits(updatedHabits)

    // Update localStorage
    const positiveHabits = updatedHabits.filter((h) => h.type === "positive")
    const negativeHabits = updatedHabits.filter((h) => h.type === "negative")

    localStorage.setItem(
      "habits",
      JSON.stringify({
        positive: positiveHabits,
        negative: negativeHabits,
      }),
    )
  }

  const toggleHabitCompletion = (habitId: string, habitType: "positive" | "negative") => {
    const isCompleted = todayCompletions.some((c) => c.habitId === habitId && c.completed)

    let updatedCompletions: HabitCompletion[]
    if (isCompleted) {
      // Remove completion
      updatedCompletions = todayCompletions.filter((c) => c.habitId !== habitId)
    } else {
      // Add completion
      updatedCompletions = [...todayCompletions, { habitId, date: today, completed: true }]
    }

    setTodayCompletions(updatedCompletions)

    // Update localStorage
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (!allDailyData[today]) {
        allDailyData[today] = {
          caloriesConsumed: 0,
          caloriesBurned: 0,
          waterDrunk: 0,
          habitsCompleted: { positive: [], negative: [] },
          streak: 0,
          foods: [],
          exercises: [],
        }
      }

      // Update habit completions
      const positiveCompletions = updatedCompletions
        .filter((c) => habits.find((h) => h.id === c.habitId)?.type === "positive")
        .map((c) => c.habitId)

      const negativeCompletions = updatedCompletions
        .filter((c) => habits.find((h) => h.id === c.habitId)?.type === "negative")
        .map((c) => c.habitId)

      allDailyData[today].habitsCompleted = {
        positive: positiveCompletions,
        negative: negativeCompletions,
      }

      localStorage.setItem("dailyData", JSON.stringify(allDailyData))

      // Update score
      const newScore = positiveCompletions.length - negativeCompletions.length
      setHabitScore(newScore)
    }
  }

  const isHabitCompleted = (habitId: string) => {
    return todayCompletions.some((c) => c.habitId === habitId && c.completed)
  }

  const positiveHabits = habits.filter((h) => h.type === "positive")
  const negativeHabits = habits.filter((h) => h.type === "negative")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="hover:bg-purple-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Habits Tracker</h1>
            <p className="text-gray-600">Build positive habits and break negative ones</p>
          </div>
        </div>

        {/* Habit Score */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Today's Habit Score</h2>
              <p className="text-4xl font-bold">{habitScore}</p>
              <p className="text-purple-100 mt-2">
                {habitScore > 0
                  ? "Great job! Keep it up!"
                  : habitScore < 0
                    ? "You can do better tomorrow!"
                    : "Start tracking your habits!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add Habit Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Habit
          </Button>
        </div>

        {/* Add Habit Form */}
        {showAddForm && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create New Habit</CardTitle>
              <CardDescription>Add a positive habit to build or a negative habit to break</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  placeholder="e.g., Drink 8 glasses of water, Exercise for 30 minutes"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description">Description (Optional)</Label>
                <Textarea
                  id="habit-description"
                  placeholder="Add more details about this habit..."
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Habit Type</Label>
                <Select
                  value={newHabit.type}
                  onValueChange={(value: "positive" | "negative") => setNewHabit({ ...newHabit, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive Habit (Build)</SelectItem>
                    <SelectItem value="negative">Negative Habit (Break)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={addHabit} className="bg-purple-600 hover:bg-purple-700">
                  Add Habit
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Positive Habits */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Positive Habits
            </CardTitle>
            <CardDescription>Habits you want to build and maintain</CardDescription>
          </CardHeader>
          <CardContent>
            {positiveHabits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No positive habits added yet</p>
                <p className="text-sm">Add some positive habits to start building good routines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {positiveHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{habit.name}</h3>
                      {habit.description && <p className="text-sm text-gray-600 mt-1">{habit.description}</p>}
                      <Badge variant="secondary" className="bg-green-100 text-green-700 mt-2">
                        +1 point
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isHabitCompleted(habit.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleHabitCompletion(habit.id, "positive")}
                        className={isHabitCompleted(habit.id) ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Negative Habits */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Negative Habits
            </CardTitle>
            <CardDescription>Habits you want to break and avoid</CardDescription>
          </CardHeader>
          <CardContent>
            {negativeHabits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No negative habits added yet</p>
                <p className="text-sm">Add negative habits you want to break</p>
              </div>
            ) : (
              <div className="space-y-3">
                {negativeHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{habit.name}</h3>
                      {habit.description && <p className="text-sm text-gray-600 mt-1">{habit.description}</p>}
                      <Badge variant="secondary" className="bg-red-100 text-red-700 mt-2">
                        -1 point
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isHabitCompleted(habit.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleHabitCompletion(habit.id, "negative")}
                        className={isHabitCompleted(habit.id) ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50"}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
