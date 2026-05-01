const cron = require('node-cron')
const Application = require('../models/Application')
const User = require('../models/User')
const { sendFollowUpReminder } = require('../config/email')

// ── Run every day at 9:00 AM ─────────────────────────────
const startReminderCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily follow-up reminder job...')
    try {
      // Get all users with reminders enabled
      const users = await User.find({ reminderEnabled: true })

      for (const user of users) {
        const cutoffDate = new Date(Date.now() - (user.reminderDays || 5) * 86400000)

        const stalledApps = await Application.find({
          user: user._id,
          status: 'applied',
          reminderSent: false,
          appliedDate: { $lte: cutoffDate }
        })

        if (stalledApps.length === 0) continue

        try {
          await sendFollowUpReminder({
            to: user.email,
            name: user.name,
            applications: stalledApps.map(a => ({
              company: a.company,
              role: a.role,
              location: a.location,
              daysSince: Math.floor((Date.now() - new Date(a.appliedDate)) / 86400000)
            }))
          })

          // Mark as reminder sent
          await Application.updateMany(
            { _id: { $in: stalledApps.map(a => a._id) } },
            { reminderSent: true }
          )

          console.log(`✉️  Reminder sent to ${user.email} for ${stalledApps.length} apps`)
        } catch (emailErr) {
          console.error(`Failed to send reminder to ${user.email}:`, emailErr.message)
        }
      }
    } catch (err) {
      console.error('Reminder cron error:', err.message)
    }
  }, {
    timezone: 'America/New_York'
  })

  console.log('✅ Reminder cron job scheduled (daily 9AM ET)')
}

module.exports = { startReminderCron }
