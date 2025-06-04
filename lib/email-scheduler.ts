export class EmailScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.init()
  }

  init() {
    // Schedule all email reminders
    this.scheduleMorningReminder() // 7 AM
    this.scheduleAfternoonReminder() // 12 PM
    this.scheduleEveningReminder() // 8 PM
    this.scheduleWaterReminders() // Every hour
    this.scheduleDailyReport() // 10 PM
  }

  private async sendEmail(type: string, additionalData?: any) {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      if (!profile.email) return

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          email: profile.email,
          name: profile.name,
          data: additionalData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        console.log(`${type} email sent successfully`)
      } else {
        console.error(`Failed to send ${type} email:`, result.error)
      }
    } catch (error) {
      console.error(`Error sending ${type} email:`, error)
    }
  }

  private scheduleTimeBasedEmail(hour: number, minute: number, type: string, intervalKey: string) {
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilEmail = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.sendEmail(type)

      // Schedule for every day
      const dailyInterval = setInterval(
        () => {
          this.sendEmail(type)
        },
        24 * 60 * 60 * 1000, // Every 24 hours
      )

      this.intervals.set(intervalKey, dailyInterval)
    }, timeUntilEmail)
  }

  scheduleMorningReminder() {
    this.scheduleTimeBasedEmail(7, 0, "morning_reminder", "morning")
  }

  scheduleAfternoonReminder() {
    this.scheduleTimeBasedEmail(12, 0, "afternoon_reminder", "afternoon")
  }

  scheduleEveningReminder() {
    this.scheduleTimeBasedEmail(20, 0, "evening_reminder", "evening")
  }

  scheduleWaterReminders() {
    // Start water reminders immediately, then every hour
    const waterInterval = setInterval(
      () => {
        this.sendEmail("water_reminder")
      },
      60 * 60 * 1000, // Every hour
    )

    this.intervals.set("water", waterInterval)
  }

  scheduleDailyReport() {
    const scheduleReport = () => {
      const now = new Date()
      const reportTime = new Date()
      reportTime.setHours(22, 0, 0, 0) // 10 PM

      // If it's past 10 PM today, schedule for tomorrow
      if (reportTime <= now) {
        reportTime.setDate(reportTime.getDate() + 1)
      }

      const timeUntilReport = reportTime.getTime() - now.getTime()

      setTimeout(() => {
        this.generateAndSendDailyReport()

        // Schedule for every day
        const dailyInterval = setInterval(
          () => {
            this.generateAndSendDailyReport()
          },
          24 * 60 * 60 * 1000,
        )

        this.intervals.set("daily_report", dailyInterval)
      }, timeUntilReport)
    }

    scheduleReport()
  }

  private async generateAndSendDailyReport() {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      const today = new Date().toISOString().split("T")[0]
      const dailyData = JSON.parse(localStorage.getItem("dailyData") || "{}")
      const todayData = dailyData[today] || {}

      const reportData = {
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        caloriesConsumed: todayData.caloriesConsumed || 0,
        caloriesBurned: todayData.caloriesBurned || 0,
        waterDrunk: todayData.waterDrunk || 0,
        habitsCompleted: todayData.habitsCompleted || { positive: [], negative: [] },
        foods: todayData.foods || [],
        exercises: todayData.exercises || [],
        targetCalories: profile.targetCalories,
        waterIntake: profile.waterIntake,
        goal: profile.goal,
      }

      await this.sendEmail("daily_report", reportData)
    } catch (error) {
      console.error("Error generating daily report:", error)
    }
  }

  // Clean up all intervals
  destroy() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
  }
}
