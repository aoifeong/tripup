TripUp
A React Native mobile holiday planner where users can create trips, log activities, organise them by category, set activity targets, and view insights.
IS4447 Mobile Application Development Project (Option B: Holiday / Trip Planner)
Built by Aoife Ong (Student No. 122335683)

GitHub Repository
https://github.com/aoifeong/tripup

Expo Preview Link (runs in Expo Go)
https://expo.dev/preview/update?message=final+submission&updateRuntimeVersion=1.0.0&createdAt=2026-04-21T20%3A13%3A23.200Z&slug=exp&projectId=1ddce750-8a53-48e9-b157-b0ff6b6c322f&group=8e92e2b8-cc2b-4701-83d1-fdedb8760a8f

See qr-code.png in this folder for a scannable QR code.

To run on your phone:
- Install Expo Go from the App Store (iOS) or Play Store (Android)
- Open the link above on your phone, or scan the QR code with Expo Go
- The app will load

The demo video is in the zip.

Running the Project Locally:
Prerequisites:
- Node.js 18+
- Expo Go app installed on your phone, or an Android emulator:

# 1. Clone the repository
git clone https://github.com/aoifeong/tripup.git
cd tripup

# 2. Install dependencies
npm install

# 3. (Optional) Create a .env.local file for the weather widget
# Copy .env.example to .env.local and add your OpenWeatherMap API key
# The app still runs without it — the weather widget just won't load

# 4. Start the dev server
npx expo start

# 5. Scan the QR code with Expo Go, or press 'a' for Android emulator

Demo Login:
A demo account is auto-seeded on first launch:
Email: demo@example.com
Password: demo123

Features:
Core:
- Register / login / logout / delete account with hashed passwords 
- Trips CRUD: create, edit, delete trips with start/end dates and destination
- Activities CRUD within each trip (title, date, duration, category)
- Categories: global categories with name and colour swatches, create and delete
- Targets: per-trip activity target with Met / Exceeded / Behind status badges
- Insights: summary stats, donut chart by category, and a bar chart that switches between Daily / Weekly / Monthly views
- Search & filter: filter activities by text, category, and date range
- Local SQLite persistence via Drizzle ORM with seed script
- Three tests: unit (seed function), component (FormField), integration (seed - DB - read)

Advanced:
- Dark mode toggle
- Weather API integration (OpenWeatherMap): live weather per destination, with loading + error states
- Streak tracking: current and longest consecutive-day streaks shown on profile
- CSV export: export all activities to a CSV file via the native share sheet

Running the Tests:
Run: npm test
All three test suites should pass:
1. seed.test.ts 
2. formfield.test.tsx 
3. trips.test.tsx 

