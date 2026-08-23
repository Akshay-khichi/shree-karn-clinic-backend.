# Shree Karn Clinic Backend API

## Deployment & Health Check (Render Free Tier)

This backend is deployed on Render's free tier. Free tier services sleep after 15 minutes of inactivity.

### Prevent Cold Starts:
To prevent cold-start delays and keep the backend alive 24/7:
1. Sign up for a free uptime monitoring service like [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org).
2. Add an HTTP(s) monitor targeting:
   - \https://shree-karn-clinic-backend.onrender.com/api/health\ or \https://shree-karn-clinic-backend.onrender.com/\`n3. Set the monitoring interval to **every 5 to 10 minutes**.
