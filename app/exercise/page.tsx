"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, ArrowLeft, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Exercise {
  name: string
  type: string
  muscle: string
  equipment: string
  difficulty: string
  instructions: string
}

interface LoggedExercise {
  id: string
  name: string
  duration: number
  caloriesBurned: number
  timestamp: string
}

export default function ExerciseTracker() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([])
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0)

  const RAPIDAPI_KEY = "ebf25a47bamsh2406ecd4485bfbap12b670jsn034023b67bcb"

  useEffect(() => {
    // Check if profile exists
    const userProfile = localStorage.getItem("userProfile")
    if (!userProfile) {
      router.push("/")
      return
    }

    // Load today's logged exercises
    loadTodaysExercises()
  }, [router])

  const loadTodaysExercises = () => {
    const today = new Date().toISOString().split("T")[0]
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today] && allDailyData[today].exercises) {
        setLoggedExercises(allDailyData[today].exercises)
        const total = allDailyData[today].exercises.reduce(
          (sum: number, exercise: LoggedExercise) => sum + exercise.caloriesBurned,
          0,
        )
        setTotalCaloriesBurned(total)
      }
    }
  }

  const searchExercises = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchQuery)}?limit=10`,
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        },
      )
      const data = await response.json()
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error searching exercises:", error)
      // Fallback with mock data for demo
      setSearchResults([
        {
          name: searchQuery,
          type: "cardio",
          muscle: "full body",
          equipment: "body weight",
          difficulty: "beginner",
          instructions: "Perform the exercise as instructed",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const calculateCaloriesBurned = (exerciseName: string, duration: number) => {
    // Simplified calorie calculation based on exercise type and duration
    const calorieRates: { [key: string]: number } = {
      running: 10,
      walking: 5,
      cycling: 8,
      swimming: 12,
      weightlifting: 6,
      yoga: 3,
      cardio: 8,
      strength: 6,
      default: 7,
    }

    const exerciseType = exerciseName.toLowerCase()
    let rate = calorieRates.default

    for (const [type, value] of Object.entries(calorieRates)) {
      if (exerciseType.includes(type)) {
        rate = value
        break
      }
    }

    return Math.round(rate * duration)
  }

  const logExercise = (exercise: Exercise, duration = 30) => {
    const caloriesBurned = calculateCaloriesBurned(exercise.name, duration)

    const loggedExercise: LoggedExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      duration,
      caloriesBurned,
      timestamp: new Date().toISOString(),
    }

    const updatedExercises = [...loggedExercises, loggedExercise]
    setLoggedExercises(updatedExercises)

    const newTotal = totalCaloriesBurned + caloriesBurned
    setTotalCaloriesBurned(newTotal)

    // Update localStorage
    const today = new Date().toISOString().split("T")[0]
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
      allDailyData[today].exercises = updatedExercises
      allDailyData[today].caloriesBurned = newTotal
      localStorage.setItem("dailyData", JSON.stringify(allDailyData))
    }
  }

  const removeExercise = (exerciseId: string) => {
    const exerciseToRemove = loggedExercises.find((exercise) => exercise.id === exerciseId)
    if (!exerciseToRemove) return

    const updatedExercises = loggedExercises.filter((exercise) => exercise.id !== exerciseId)
    setLoggedExercises(updatedExercises)

    const newTotal = totalCaloriesBurned - exerciseToRemove.caloriesBurned
    setTotalCaloriesBurned(newTotal)

    // Update localStorage
    const today = new Date().toISOString().split("T")[0]
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today]) {
        allDailyData[today].exercises = updatedExercises
        allDailyData[today].caloriesBurned = newTotal
        localStorage.setItem("dailyData", JSON.stringify(allDailyData))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="hover:bg-orange-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Tracker</h1>
            <p className="text-gray-600">Log your workouts and activities</p>
          </div>
        </div>

        {/* Calories Burned Summary */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Calories Burned Today</h2>
              <p className="text-4xl font-bold">{totalCaloriesBurned}</p>
              <p className="text-orange-100 mt-2">{loggedExercises.length} exercises logged</p>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-600" />
              Search Exercises
            </CardTitle>
            <CardDescription>Find exercises from the Exercise Database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for exercises (e.g., push up, squat, running)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchExercises()}
                className="flex-1"
              />
              <Button onClick={searchExercises} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Common Exercises */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-600" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Running", type: "cardio" },
                { name: "Walking", type: "cardio" },
                { name: "Push-ups", type: "strength" },
                { name: "Squats", type: "strength" },
                { name: "Cycling", type: "cardio" },
                { name: "Swimming", type: "cardio" },
                { name: "Yoga", type: "flexibility" },
                { name: "Weight Training", type: "strength" },
              ].map((exercise) => (
                <Button
                  key={exercise.name}
                  variant="outline"
                  className="h-16 flex flex-col gap-1 hover:bg-orange-50"
                  onClick={() => {
                    const mockExercise: Exercise = {
                      name: exercise.name,
                      type: exercise.type,
                      muscle: "various",
                      equipment: "various",
                      difficulty: "beginner",
                      instructions: `Perform ${exercise.name} exercise`,
                    }
                    logExercise(mockExercise, 30)
                  }}
                >
                  <span className="font-medium">{exercise.name}</span>
                  <span className="text-xs text-gray-500">30 min</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 capitalize">{exercise.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          {exercise.type}
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          {exercise.muscle}
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          {exercise.equipment}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="30"
                        className="w-20"
                        id={`duration-${index}`}
                        defaultValue="30"
                      />
                      <Label htmlFor={`duration-${index}`} className="text-xs text-gray-500">
                        min
                      </Label>
                      <Button
                        size="sm"
                        onClick={() => {
                          const durationInput = document.getElementById(`duration-${index}`) as HTMLInputElement
                          const duration = Number.parseInt(durationInput.value) || 30
                          logExercise(exercise, duration)
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logged Exercises */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Today's Workouts</CardTitle>
            <CardDescription>Exercises you've completed today</CardDescription>
          </CardHeader>
          <CardContent>
            {loggedExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No exercises logged yet today</p>
                <p className="text-sm">Add exercises to start tracking your workouts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loggedExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 capitalize">{exercise.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          {exercise.caloriesBurned} cal
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          {exercise.duration} min
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(exercise.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
