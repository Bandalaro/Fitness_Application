// Notification system for FitTracker Pro
// This script handles reminder notifications for the fitness tracker

class FitnessNotifications {
  constructor() {
    this.isNotificationSupported = "Notification" in window
    this.permission = null
    this.intervals = new Map()

    this.init()
  }

  async init() {
    if (!this.isNotificationSupported) {
      console.log("Notifications not supported in this browser")
      return
    }

    // Request notification permission
    this.permission = await Notification.requestPermission()

    if (this.permission === "granted") {
      console.log("Notification permission granted")
      this.setupReminders()
    } else {
      console.log("Notification permission denied")
    }
  }

  setupReminders() {
    // Water reminder every hour
    this.scheduleWaterReminder()

    // Meal reminders (morning, afternoon, night)
    this.scheduleMealReminders()

    // End of day report reminder
    this.scheduleEODReminder()
  }

  scheduleWaterReminder() {
    const waterInterval = setInterval(
      () => {
        this.sendNotification("💧 Hydration Reminder", "Time to drink 500ml of water! Stay hydrated!", "/dashboard")
      },
      60 * 60 * 1000,
    ) // Every hour

    this.intervals.set("water", waterInterval)
  }

  scheduleMealReminders() {
    const now = new Date()

    // Morning reminder (8 AM)
    this.scheduleTimeBasedReminder(
      8,
      0,
      "🌅 Good Morning!",
      "Don't forget to log your breakfast and start tracking your day!",
    )

    // Afternoon reminder (1 PM)
    this.scheduleTimeBasedReminder(
      13,
      0,
      "🌞 Afternoon Check-in",
      "How's your day going? Remember to log your lunch and stay active!",
    )

    // Evening reminder (7 PM)
    this.scheduleTimeBasedReminder(
      19,
      0,
      "🌙 Evening Reminder",
      "Time to log your dinner and review your daily progress!",
    )
  }

  scheduleEODReminder() {
    // End of day reminder (9 PM)
    this.scheduleTimeBasedReminder(
      21,
      0,
      "📊 Daily Summary Ready",
      "Your daily report is ready! Check your progress and plan for tomorrow.",
    )
  }

  scheduleTimeBasedReminder(hour, minute, title, body) {
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.sendNotification(title, body, "/dashboard")

      // Schedule for the next day
      const dailyInterval = setInterval(
        () => {
          this.sendNotification(title, body, "/dashboard")
        },
        24 * 60 * 60 * 1000,
      ) // Every 24 hours

      this.intervals.set(`${hour}-${minute}`, dailyInterval)
    }, timeUntilReminder)
  }

  sendNotification(title, body, url = null) {
    if (this.permission !== "granted") return

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "fitness-tracker",
      requireInteraction: false,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      if (url) {
        window.location.href = url
      }
      notification.close()
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  // Method to send habit reminder
  sendHabitReminder(habitName) {
    this.sendNotification("✅ Habit Reminder", `Don't forget to complete: ${habitName}`, "/habits")
  }

  // Method to send calorie tracking reminder
  sendCalorieReminder(remainingCalories) {
    const message =
      remainingCalories > 0
        ? `You have ${remainingCalories} calories left for today!`
        : `You've reached your calorie goal for today!`

    this.sendNotification("🍎 Calorie Tracking", message, "/food")
  }

  // Method to send exercise reminder
  sendExerciseReminder() {
    this.sendNotification(
      "💪 Exercise Reminder",
      "Time to get moving! Log your workout and burn some calories.",
      "/exercise",
    )
  }

  // Clean up intervals
  destroy() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
  }
}

// Initialize notifications when the page loads
if (typeof window !== "undefined") {
  window.fitnessNotifications = new FitnessNotifications()
}

console.log("Fitness notification system initialized")
