"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Food {
  fdcId: number
  description: string
  foodNutrients: Array<{
    nutrientId: number
    nutrientName: string
    value: number
    unitName: string
  }>
}

interface LoggedFood {
  id: string
  name: string
  calories: number
  quantity: number
  timestamp: string
}

export default function FoodTracker() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([])
  const [totalCalories, setTotalCalories] = useState(0)

  const USDA_API_KEY = "xnJzB6OBcjwWyFqsaDhq1SLTbsxCbKxMNCipsoBw"

  useEffect(() => {
    // Check if profile exists
    const userProfile = localStorage.getItem("userProfile")
    if (!userProfile) {
      router.push("/")
      return
    }

    // Load today's logged foods
    loadTodaysFoods()
  }, [router])

  const loadTodaysFoods = () => {
    const today = new Date().toISOString().split("T")[0]
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today] && allDailyData[today].foods) {
        setLoggedFoods(allDailyData[today].foods)
        const total = allDailyData[today].foods.reduce((sum: number, food: LoggedFood) => sum + food.calories, 0)
        setTotalCalories(total)
      }
    }
  }

  const searchFoods = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQuery)}&pageSize=10&api_key=${USDA_API_KEY}`,
      )
      const data = await response.json()
      setSearchResults(data.foods || [])
    } catch (error) {
      console.error("Error searching foods:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCaloriesFromFood = (food: Food) => {
    const energyNutrient = food.foodNutrients.find(
      (nutrient) => nutrient.nutrientName === "Energy" || nutrient.nutrientId === 1008,
    )
    return energyNutrient ? Math.round(energyNutrient.value) : 0
  }

  const logFood = (food: Food, quantity = 100) => {
    const calories = getCaloriesFromFood(food)
    const adjustedCalories = Math.round((calories * quantity) / 100)

    const loggedFood: LoggedFood = {
      id: Date.now().toString(),
      name: food.description,
      calories: adjustedCalories,
      quantity,
      timestamp: new Date().toISOString(),
    }

    const updatedFoods = [...loggedFoods, loggedFood]
    setLoggedFoods(updatedFoods)

    const newTotal = totalCalories + adjustedCalories
    setTotalCalories(newTotal)

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
      allDailyData[today].foods = updatedFoods
      allDailyData[today].caloriesConsumed = newTotal
      localStorage.setItem("dailyData", JSON.stringify(allDailyData))
    }
  }

  const removeFood = (foodId: string) => {
    const foodToRemove = loggedFoods.find((food) => food.id === foodId)
    if (!foodToRemove) return

    const updatedFoods = loggedFoods.filter((food) => food.id !== foodId)
    setLoggedFoods(updatedFoods)

    const newTotal = totalCalories - foodToRemove.calories
    setTotalCalories(newTotal)

    // Update localStorage
    const today = new Date().toISOString().split("T")[0]
    const dailyDataStr = localStorage.getItem("dailyData")
    if (dailyDataStr) {
      const allDailyData = JSON.parse(dailyDataStr)
      if (allDailyData[today]) {
        allDailyData[today].foods = updatedFoods
        allDailyData[today].caloriesConsumed = newTotal
        localStorage.setItem("dailyData", JSON.stringify(allDailyData))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="hover:bg-green-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Tracker</h1>
            <p className="text-gray-600">Search and log your meals</p>
          </div>
        </div>

        {/* Calories Summary */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Today's Calories</h2>
              <p className="text-4xl font-bold">{totalCalories}</p>
              <p className="text-green-100 mt-2">{loggedFoods.length} items logged</p>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Search Foods
            </CardTitle>
            <CardDescription>Search the USDA food database to find nutritional information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for foods (e.g., apple, chicken breast, rice)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchFoods()}
                className="flex-1"
              />
              <Button onClick={searchFoods} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Searching..." : "Search"}
              </Button>
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
                {searchResults.map((food) => (
                  <div key={food.fdcId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{food.description}</h3>
                      <p className="text-sm text-gray-600">{getCaloriesFromFood(food)} calories per 100g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="100"
                        className="w-20"
                        id={`quantity-${food.fdcId}`}
                        defaultValue="100"
                      />
                      <Label htmlFor={`quantity-${food.fdcId}`} className="text-xs text-gray-500">
                        g
                      </Label>
                      <Button
                        size="sm"
                        onClick={() => {
                          const quantityInput = document.getElementById(`quantity-${food.fdcId}`) as HTMLInputElement
                          const quantity = Number.parseInt(quantityInput.value) || 100
                          logFood(food, quantity)
                        }}
                        className="bg-green-600 hover:bg-green-700"
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

        {/* Logged Foods */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
            <CardDescription>Foods you've logged today</CardDescription>
          </CardHeader>
          <CardContent>
            {loggedFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No foods logged yet today</p>
                <p className="text-sm">Search and add foods to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loggedFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{food.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {food.calories} cal
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          {food.quantity}g
                        </Badge>
                        <span className="text-xs text-gray-500">{new Date(food.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFood(food.id)}
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
