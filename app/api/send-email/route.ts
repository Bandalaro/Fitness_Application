import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_Lwrbvbq4_21VrBc1bs3CuvtgV3MMbhLyC")

export async function POST(request: Request) {
  try {
    const { type, email, name, data } = await request.json()

    let subject = ""
    let htmlContent = ""

    switch (type) {
      case "morning_reminder":
        subject = "🌅 Good Morning! Start Your Fitness Day"
        htmlContent = generateMorningReminderHTML(name)
        break
      case "afternoon_reminder":
        subject = "🌞 Afternoon Check-in - Stay on Track!"
        htmlContent = generateAfternoonReminderHTML(name)
        break
      case "evening_reminder":
        subject = "🌙 Evening Review - Complete Your Day"
        htmlContent = generateEveningReminderHTML(name)
        break
      case "water_reminder":
        subject = "💧 Hydration Reminder - Drink Water!"
        htmlContent = generateWaterReminderHTML(name)
        break
      case "daily_report":
        subject = `📊 Your Daily Fitness Report - ${new Date().toLocaleDateString()}`
        htmlContent = generateDailyReportHTML(name, data)
        break
      case "welcome_email":
        subject = "🎉 Welcome to FitTracker Pro - Profile Created Successfully!"
        htmlContent = generateWelcomeEmailHTML(name, data)
        break
      default:
        throw new Error("Invalid email type")
    }

    const result = await resend.emails.send({
      from: "FitTracker Pro <onboarding@resend.dev>",
      to: email,
      subject: subject,
      html: htmlContent,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

function generateMorningReminderHTML(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Good Morning - FitTracker Pro</title>
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
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .emoji {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                color: #555;
                margin-bottom: 30px;
            }
            .tasks {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .task-item {
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            .task-item:last-child {
                border-bottom: none;
            }
            .cta {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                display: inline-block;
                margin-top: 20px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃‍♂️ FitTracker Pro</h1>
            </div>
            
            <div class="content">
                <div class="emoji">🌅</div>
                <h2>Good Morning, ${name}!</h2>
                <p class="message">Start your day strong! Here's what you should focus on today:</p>
                
                <div class="tasks">
                    <div class="task-item">
                        <strong>🍳 Log your breakfast</strong> - Track your morning calories
                    </div>
                    <div class="task-item">
                        <strong>💧 Drink water</strong> - Start hydrating for the day
                    </div>
                    <div class="task-item">
                        <strong>✅ Review your habits</strong> - Check your positive habits list
                    </div>
                    <div class="task-item">
                        <strong>🎯 Set daily intentions</strong> - Plan your meals and workouts
                    </div>
                </div>
                
                <p>Remember: Every small step counts towards your fitness goals!</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateAfternoonReminderHTML(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Afternoon Check-in - FitTracker Pro</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
                border-bottom: 3px solid #f5576c;
            }
            .header h1 {
                color: #f5576c;
                margin: 0;
                font-size: 28px;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .emoji {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                color: #555;
                margin-bottom: 30px;
            }
            .checklist {
                background: #fff3cd;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .check-item {
                padding: 8px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃‍♂️ FitTracker Pro</h1>
            </div>
            
            <div class="content">
                <div class="emoji">🌞</div>
                <h2>Afternoon Check-in, ${name}!</h2>
                <p class="message">How's your day going? Time for a quick progress check:</p>
                
                <div class="checklist">
                    <div class="check-item">
                        ✓ Have you logged your lunch?
                    </div>
                    <div class="check-item">
                        ✓ Are you staying hydrated?
                    </div>
                    <div class="check-item">
                        ✓ Have you completed any exercises today?
                    </div>
                    <div class="check-item">
                        ✓ Are you on track with your positive habits?
                    </div>
                </div>
                
                <p><strong>Afternoon Boost:</strong> Consider a healthy snack and some light activity!</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateEveningReminderHTML(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Evening Review - FitTracker Pro</title>
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
                border-bottom: 3px solid #764ba2;
            }
            .header h1 {
                color: #764ba2;
                margin: 0;
                font-size: 28px;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .emoji {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                color: #555;
                margin-bottom: 30px;
            }
            .evening-tasks {
                background: #e8f4fd;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .evening-item {
                padding: 10px 0;
                border-bottom: 1px solid #bee5eb;
                color: #0c5460;
            }
            .evening-item:last-child {
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃‍♂️ FitTracker Pro</h1>
            </div>
            
            <div class="content">
                <div class="emoji">🌙</div>
                <h2>Evening Review, ${name}!</h2>
                <p class="message">Time to wrap up your day and review your progress:</p>
                
                <div class="evening-tasks">
                    <div class="evening-item">
                        <strong>🍽️ Log your dinner</strong> - Complete your daily nutrition tracking
                    </div>
                    <div class="evening-item">
                        <strong>📊 Review your progress</strong> - Check your daily goals
                    </div>
                    <div class="evening-item">
                        <strong>✅ Complete remaining habits</strong> - Finish strong!
                    </div>
                    <div class="evening-item">
                        <strong>💧 Final hydration check</strong> - Did you reach your water goal?
                    </div>
                    <div class="evening-item">
                        <strong>📝 Plan tomorrow</strong> - Set intentions for tomorrow
                    </div>
                </div>
                
                <p>Your daily report will arrive at 10 PM. Great job today! 🎉</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateWaterReminderHTML(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Hydration Reminder - FitTracker Pro</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                text-align: center;
            }
            .emoji {
                font-size: 64px;
                margin-bottom: 15px;
            }
            .title {
                color: #38f9d7;
                font-size: 24px;
                margin-bottom: 15px;
            }
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 20px;
            }
            .water-tip {
                background: #e8f8f5;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                color: #0c5460;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="emoji">💧</div>
            <h2 class="title">Hydration Time, ${name}!</h2>
            <p class="message">It's time to drink a glass of water (500ml) to stay properly hydrated.</p>
            
            <div class="water-tip">
                <strong>💡 Hydration Tip:</strong> Proper hydration boosts energy, improves focus, and supports your fitness goals!
            </div>
            
            <p style="font-size: 14px; color: #666;">
                Remember to log your water intake in the FitTracker app.
            </p>
        </div>
    </body>
    </html>
  `
}

function generateDailyReportHTML(name: string, data: any) {
  const caloriesConsumed = data.caloriesConsumed || 0
  const caloriesBurned = data.caloriesBurned || 0
  const waterDrunk = data.waterDrunk || 0
  const habitsCompleted = data.habitsCompleted || { positive: [], negative: [] }
  const foods = data.foods || []
  const exercises = data.exercises || []
  const targetCalories = data.targetCalories || 2000
  const waterIntake = data.waterIntake || 2.5

  const netCalories = caloriesConsumed - caloriesBurned
  const calorieProgress = Math.round((caloriesConsumed / targetCalories) * 100)
  const waterProgress = Math.round((waterDrunk / waterIntake) * 100)
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
                <div class="date">Daily Report for ${new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
                <p>Hello ${name}! Here's your daily fitness summary.</p>
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

            ${
              foods.length > 0
                ? `
            <div class="section">
                <h3><span class="emoji">🍎</span>Foods Consumed</h3>
                ${foods
                  .map(
                    (food: any) => `
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
                    (exercise: any) => `
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

function generateWelcomeEmailHTML(name: string, data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to FitTracker Pro</title>
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
            .welcome-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 20px 0;
            }
            .profile-summary {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .profile-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .profile-item:last-child {
                border-bottom: none;
            }
            .next-steps {
                background: #e8f4fd;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .step {
                padding: 10px 0;
                border-bottom: 1px solid #bee5eb;
            }
            .step:last-child {
                border-bottom: none;
            }
            .cta-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #eee;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏃‍♂️ FitTracker Pro</h1>
            </div>
            
            <div class="welcome-banner">
                <h2 style="margin: 0; font-size: 24px;">🎉 Welcome to FitTracker Pro!</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Your fitness journey starts now, ${name}!
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #667eea;">Profile Successfully Created! ✅</h3>
                <p>Congratulations! Your personalized fitness profile has been set up and is ready to help you achieve your goals.</p>
            </div>
            
            <div class="profile-summary">
                <h4 style="color: #667eea; margin-top: 0;">📋 Your Profile Summary</h4>
                <div class="profile-item">
                    <span><strong>Name:</strong></span>
                    <span>${name}</span>
                </div>
                <div class="profile-item">
                    <span><strong>Age:</strong></span>
                    <span>${data.age} years</span>
                </div>
                <div class="profile-item">
                    <span><strong>Height:</strong></span>
                    <span>${data.height} cm</span>
                </div>
                <div class="profile-item">
                    <span><strong>Weight:</strong></span>
                    <span>${data.weight} kg</span>
                </div>
                <div class="profile-item">
                    <span><strong>Fitness Goal:</strong></span>
                    <span style="text-transform: capitalize;">${data.goal}</span>
                </div>
                <div class="profile-item">
                    <span><strong>Daily Calorie Target:</strong></span>
                    <span>${data.targetCalories} kcal</span>
                </div>
                <div class="profile-item">
                    <span><strong>Daily Water Goal:</strong></span>
                    <span>${data.waterIntake}L</span>
                </div>
            </div>
            
            <div class="next-steps">
                <h4 style="color: #0c5460; margin-top: 0;">🚀 What's Next?</h4>
                <div class="step">
                    <strong>📧 Email Reminders:</strong> You'll receive helpful reminders at 7 AM, 12 PM, 8 PM, and hourly water reminders
                </div>
                <div class="step">
                    <strong>🍎 Track Your Food:</strong> Start logging your meals using our USDA food database
                </div>
                <div class="step">
                    <strong>💪 Log Exercises:</strong> Record your workouts and track calories burned
                </div>
                <div class="step">
                    <strong>✅ Build Habits:</strong> Create positive habits and break negative ones
                </div>
                <div class="step">
                    <strong>📊 Monitor Progress:</strong> View detailed statistics and track your journey
                </div>
                <div class="step">
                    <strong>📈 Daily Reports:</strong> Get comprehensive daily summaries at 10 PM
                </div>
            </div>
            
            <div style="text-align: center;">
                <p><strong>🎯 Your ${data.goal === "cut" ? "Weight Loss" : data.goal === "bulk" ? "Muscle Building" : "Maintenance"} Journey Starts Now!</strong></p>
                <p>We've calculated your personalized targets based on your goals. Stay consistent, track everything, and watch your progress!</p>
            </div>
            
            <div class="footer">
                <p>💪 Ready to transform your fitness journey?</p>
                <p><strong>Your first morning reminder will arrive at 7 AM tomorrow!</strong></p>
                <p><small>Welcome to the FitTracker Pro family! 🎉</small></p>
            </div>
        </div>
    </body>
    </html>
  `
}
