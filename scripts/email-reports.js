// Email reporting system for FitTracker Pro
// This script generates and sends daily email reports

class EmailReportSystem {
  constructor() {
    this.emailService = "https://api.emailjs.com/api/v1.0/email/send" // Example service
    this.init()
  }

  init() {
    // Schedule daily report at 10 PM
    this.scheduleDailyReport()
  }

  scheduleDailyReport() {
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
      setInterval(
        () => {
          this.generateAndSendDailyReport()
        },
        24 * 60 * 60 * 1000,
      )
    }, timeUntilReport)
  }

  async generateAndSendDailyReport() {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      const today = new Date().toISOString().split("T")[0]
      const dailyData = JSON.parse(localStorage.getItem("dailyData") || "{}")
      const todayData = dailyData[today] || {}

      const report = this.generateReportHTML(profile, todayData, today)
      await this.sendEmail(profile.email, report)

      console.log("Daily report sent successfully")
    } catch (error) {
      console.error("Error sending daily report:", error)
    }
  }

  generateReportHTML(profile, todayData, date) {
    const caloriesConsumed = todayData.caloriesConsumed || 0
    const caloriesBurned = todayData.caloriesBurned || 0
    const waterDrunk = todayData.waterDrunk || 0
    const habitsCompleted = todayData.habitsCompleted || { positive: [], negative: [] }
    const foods = todayData.foods || []
    const exercises = todayData.exercises || []

    const netCalories = caloriesConsumed - caloriesBurned
    const calorieProgress = Math.round((caloriesConsumed / profile.targetCalories) * 100)
    const waterProgress = Math.round((waterDrunk / profile.waterIntake) * 100)
    const habitScore = habitsCompleted.positive.length - habitsCompleted.negative.length

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>FitTracker Pro - Daily Report</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #667eea;
            }
            .header h1 {
                color: #667eea;
                margin: 0;
                font-size: 28px;
            }
            .date {
                color: #666;
                font-size: 16px;
                margin-top: 5px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .stat-card {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-card.calories { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
            .stat-card.water { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
            .stat-card.exercise { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
            .stat-card.habits { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .stat-label {
                font-size: 12px;
                opacity: 0.9;
            }
            .progress-bar {
                background: #e0e0e0;
                border-radius: 10px;
                height: 8px;
                margin: 10px 0;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                border-radius: 10px;
                transition: width 0.3s ease;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            .section h3 {
                color: #667eea;
                margin-top: 0;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            .food-item, .exercise-item {
                background: white;
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                border-left: 4px solid #667eea;
            }
            .emoji {
                font-size: 20px;
                margin-right: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #eee;
                color: #666;
            }
            .goal-status {
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
            }
            .goal-status.success { background: #d4edda; color: #155724; }
            .goal-status.warning { background: #fff3cd; color: #856404; }
            .goal-status.danger { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃‍♂️ FitTracker Pro</h1>
                <div class="date">Daily Report for ${new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
                <p>Hello ${profile.name}! Here's your daily fitness summary.</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card calories">
                    <div class="stat-value">${caloriesConsumed}</div>
                    <div class="stat-label">Calories Consumed</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(calorieProgress, 100)}%"></div>
                    </div>
                    <div style="font-size: 11px; margin-top: 5px;">${calorieProgress}% of goal</div>
                </div>
                
                <div class="stat-card water">
                    <div class="stat-value">${waterDrunk}L</div>
                    <div class="stat-label">Water Intake</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(waterProgress, 100)}%"></div>
                    </div>
                    <div style="font-size: 11px; margin-top: 5px;">${waterProgress}% of goal</div>
                </div>
                
                <div class="stat-card exercise">
                    <div class="stat-value">${caloriesBurned}</div>
                    <div class="stat-label">Calories Burned</div>
                </div>
                
                <div class="stat-card habits">
                    <div class="stat-value">${habitScore >= 0 ? "+" : ""}${habitScore}</div>
                    <div class="stat-label">Habit Score</div>
                </div>
            </div>

            <div class="goal-status ${this.getGoalStatusClass(profile.goal, netCalories, profile.targetCalories)}">
                ${this.getGoalStatusMessage(profile.goal, netCalories, profile.targetCalories)}
            </div>

            ${
              foods.length > 0
                ? `
            <div class="section">
                <h3><span class="emoji">🍎</span>Foods Consumed</h3>
                ${foods
                  .map(
                    (food) => `
                    <div class="food-item">
                        <strong>${food.name}</strong> - ${food.calories} calories (${food.quantity}g)
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            ${new Date(food.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            ${
              exercises.length > 0
                ? `
            <div class="section">
                <h3><span class="emoji">💪</span>Exercises Completed</h3>
                ${exercises
                  .map(
                    (exercise) => `
                    <div class="exercise-item">
                        <strong>${exercise.name}</strong> - ${exercise.duration} minutes
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            Burned ${exercise.caloriesBurned} calories at ${new Date(exercise.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            `
                : ""
            }

            <div class="section">
                <h3><span class="emoji">✅</span>Habits Tracking</h3>
                <p><strong>Positive habits completed:</strong> ${habitsCompleted.positive.length}</p>
                <p><strong>Negative habits avoided:</strong> ${habitsCompleted.negative.length}</p>
                <p><strong>Overall score:</strong> ${habitScore >= 0 ? "+" : ""}${habitScore} points</p>
            </div>

            <div class="section">
                <h3><span class="emoji">🎯</span>Tomorrow's Focus</h3>
                <ul>
                    ${calorieProgress < 80 ? "<li>Increase calorie intake to meet your daily goal</li>" : ""}
                    ${waterProgress < 80 ? "<li>Drink more water throughout the day</li>" : ""}
                    ${caloriesBurned < 200 ? "<li>Add more physical activity to burn calories</li>" : ""}
                    ${habitScore < 0 ? "<li>Focus on completing positive habits and avoiding negative ones</li>" : ""}
                    <li>Keep up the great work and stay consistent!</li>
                </ul>
            </div>

            <div class="footer">
                <p>Keep pushing towards your goals! 💪</p>
                <p><small>Generated by FitTracker Pro on ${new Date().toLocaleString()}</small></p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  getGoalStatusClass(goal, netCalories, targetCalories) {
    if (goal === "cut") {
      return netCalories < targetCalories ? "success" : "warning"
    } else if (goal === "bulk") {
      return netCalories > targetCalories ? "success" : "warning"
    } else {
      const diff = Math.abs(netCalories - targetCalories)
      return diff < 100 ? "success" : "warning"
    }
  }

  getGoalStatusMessage(goal, netCalories, targetCalories) {
    const diff = netCalories - targetCalories

    if (goal === "cut") {
      if (diff < 0) {
        return `🎉 Great job! You're in a calorie deficit of ${Math.abs(diff)} calories, perfect for weight loss!`
      } else {
        return `⚠️ You're ${diff} calories over your target. Try to increase exercise or reduce intake tomorrow.`
      }
    } else if (goal === "bulk") {
      if (diff > 0) {
        return `🎉 Excellent! You're in a calorie surplus of ${diff} calories, great for muscle building!`
      } else {
        return `⚠️ You're ${Math.abs(diff)} calories under your target. Consider eating more to support muscle growth.`
      }
    } else {
      if (Math.abs(diff) < 100) {
        return `🎉 Perfect! You're maintaining your calorie balance within ${Math.abs(diff)} calories of your target.`
      } else {
        return `⚠️ You're ${Math.abs(diff)} calories ${diff > 0 ? "over" : "under"} your maintenance target.`
      }
    }
  }

  async sendEmail(to, htmlContent) {
    // This is a mock implementation
    // In a real app, you would integrate with an email service like EmailJS, SendGrid, etc.

    console.log("Sending email report to:", to)
    console.log("Email content generated:", htmlContent.length, "characters")

    // Mock email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Email sent successfully (mock)")
        resolve(true)
      }, 1000)
    })

    // Real implementation would look like:
    /*
    const response = await fetch(this.emailService, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'your_service_id',
        template_id: 'your_template_id',
        user_id: 'your_user_id',
        template_params: {
          to_email: to,
          html_content: htmlContent,
          subject: `FitTracker Pro - Daily Report for ${new Date().toLocaleDateString()}`
        }
      })
    })
    
    return response.ok
    */
  }

  // Method to send weekly summary
  async generateWeeklySummary() {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    const dailyData = JSON.parse(localStorage.getItem("dailyData") || "{}")

    // Get last 7 days of data
    const weekData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      weekData.push({
        date: dateStr,
        data: dailyData[dateStr] || {},
      })
    }

    // Calculate weekly averages and totals
    const weeklyStats = this.calculateWeeklyStats(weekData)
    const weeklyReport = this.generateWeeklyReportHTML(profile, weeklyStats, weekData)

    await this.sendEmail(profile.email, weeklyReport)
  }

  calculateWeeklyStats(weekData) {
    const totalDays = weekData.length
    let totalCalories = 0
    let totalWater = 0
    let totalExercise = 0
    let totalHabitsScore = 0

    weekData.forEach((day) => {
      const data = day.data
      totalCalories += data.caloriesConsumed || 0
      totalWater += data.waterDrunk || 0
      totalExercise += data.caloriesBurned || 0

      const habitsCompleted = data.habitsCompleted || { positive: [], negative: [] }
      totalHabitsScore += habitsCompleted.positive.length - habitsCompleted.negative.length
    })

    return {
      avgCalories: Math.round(totalCalories / totalDays),
      avgWater: Math.round((totalWater / totalDays) * 10) / 10,
      avgExercise: Math.round(totalExercise / totalDays),
      avgHabitsScore: Math.round((totalHabitsScore / totalDays) * 10) / 10,
      totalCalories,
      totalWater,
      totalExercise,
      totalHabitsScore,
    }
  }

  generateWeeklyReportHTML(profile, stats, weekData) {
    // Similar to daily report but with weekly data
    // This would be a more comprehensive report with trends and insights
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>FitTracker Pro - Weekly Summary</title>
        <!-- Similar styling as daily report -->
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Weekly Fitness Summary</h1>
                <p>Your week in review, ${profile.name}!</p>
            </div>
            
            <!-- Weekly stats and insights would go here -->
            
        </div>
    </body>
    </html>
    `
  }
}

// Initialize email reporting system
if (typeof window !== "undefined") {
  window.emailReportSystem = new EmailReportSystem()
}

console.log("Email reporting system initialized")
