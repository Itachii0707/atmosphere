# Atmosphere 🌥️

Atmosphere is a polished, portfolio-grade weather dashboard built using a modern full-stack web architecture. It features a high-energy, high-contrast **Neubrutalism UI design** with fluid scroll animations, interactive charts, and live particle overlays that adapt dynamically to weather conditions and time of day.

## Tech Stack
- **Frontend**: Next.js (App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion)
- **Backend API**: Python FastAPI (Uvicorn, HTTPX, python-dotenv)
- **Charting**: Chart.js (`react-chartjs-2`)
- **Icons**: Lucide React

---

## Key Features

1. **Neubrutalist Visual Design**: Dominant thick borders, flat solid black/white drop shadows, bold grotesque typography, and high-energy pastel blocks that shift when clicked.
2. **Dynamic Backgrounds & Particles**: Automatically adapts background gradients and falling particle overlays (rain, snow, drifting clouds) depending on weather codes and day/night state.
3. **Advanced Search**: Search weather by city, country, or latitude/longitude coordinates.
4. **Geolocation Detection**: Instantly detects and loads local weather using the HTML5 browser Geolocation API.
5. **Detailed Weather Diagnostics**: Displays temperature (with Celsius/Fahrenheit toggle), feels-like, wind speed/direction, humidity, air pressure, visibility, and UV index.
6. **Air Quality Index**: Integrates EPA Air Quality warnings with a color-coded gauge and clear advisory guidelines.
7. **Weather Notices**: A dedicated warning panel providing custom advisories (e.g. UV exposure warnings, rainfall alerts, temperature notices).
8. **Interactive Charts**: A smooth trend graph of temperature shifts over the next 12 hours built with Chart.js.
9. **Hourly & Daily Projections**: Horizontal hourly list for the upcoming 24 hours, and clean grids showing forecast days with rain chances.
10. **Bookmarks & History**: Save favorite locations to bookmarks, keep track of recent searches, and remove items individually via localStorage.
11. **API Key Settings Panel**: Toggle between backend environment key or enter a custom key stored locally in browser `localStorage` for safety.
12. **Dark Mode**: High contrast dark theme with cyber neon highlights, persisted in `localStorage` and responsive to system preferences without layout flashes (FOUC-free).

---

## Project Structure

```
atmosphere/
├── frontend/             # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Dashboard page
│   │   │   └── layout.tsx        # HTML wrapping & theme injection
│   │   ├── components/
│   │   │   ├── SettingsModal.tsx # API Key settings modal
│   │   │   ├── WeatherChart.tsx  # Chart.js temperature trend line
│   │   │   └── Skeleton.tsx      # Pulsing neubrutalist loader mockup
│   │   └── utils/
│   │       └── storage.ts        # localStorage preference helpers
│   ├── package.json
│   └── globals.css
└── backend/              # Python FastAPI Application
    ├── main.py           # FastAPI endpoints
    ├── .env.example
    └── requirements.txt  # Python packages
```

---

## Setup & Local Installation

### 1. Backend Setup (FastAPI)
Navigate to the `backend/` directory:
```bash
cd backend
```

Create a virtual environment and activate it:
**Windows (PowerShell)**:
```powershell
python -m venv venv
# Note: if script execution is disabled, run pip/python directly from the Scripts directory:
.\venv\Scripts\pip.exe install -r requirements.txt
```
**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file from the example:
```bash
cp .env.example .env
```
Open `.env` and enter your WeatherAPI key (get a free key at [weatherapi.com](https://www.weatherapi.com)):
```env
WEATHER_API_KEY=your_weatherapi_key_here
PORT=8000
```

Start the FastAPI development server:
```bash
# Windows
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# macOS/Linux
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup (Next.js)
Navigate to the `frontend/` directory:
```bash
cd ../frontend
```

Install node packages:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Screenshots Placeholder

> [!NOTE]
> Add screenshots of the Light and Dark Mode Neubrutalist weather dashboard here before sharing your portfolio!
> 
> | Light Mode Dashboard | Dark Mode Dashboard |
> |---|---|
> | *[Screenshot Placeholder]* | *[Screenshot Placeholder]* |

---

## Required Browser Permissions

- **Geolocation**: Required to detect current coordinates and fetch local weather on startup. If denied, the app degrades gracefully to a preset default location (Tokyo).
- **Storage**: Requires LocalStorage permission to save your dark mode setting, temperature unit preference, favorite cities, search history, and optional custom API key.

---

## Production Deployment Steps (GitHub Pages)

### Safely Handling API Keys in Production
Since static client-side deployments (like GitHub Pages) cannot securely hide environment variables, Atmosphere handles keys safely using two options:
1. **Frontend Input Settings**: Deploy the Next.js frontend as a static export. When a user opens the app, they can paste their own free WeatherAPI.com key into the Settings Modal (accessed via the cog icon in the header). The key is stored in their browser's local storage and is never exposed to the public.
2. **Server proxy**: If you choose to host the Python FastAPI backend on a server (e.g. Render, Railway, or Heroku), you can bind your `WEATHER_API_KEY` to the server environment safely, and point the frontend queries to your public server endpoint.

### Deploying the Next.js Frontend to GitHub Pages

1. **Configure Next.js for Static Export**:
   In `frontend/next.config.ts` (or `next.config.js`), enable static exports by setting `output: 'export'`:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true, // Required for static export
     },
     basePath: '/atmosphere', // Replace with your repository name
   };

   export default nextConfig;
   ```

2. **Build the static site**:
   ```bash
   npm run build
   ```
   This generates an `out/` directory containing the compiled, static HTML/CSS/JS pages.

3. **Deploy using `gh-pages` branch**:
   Install the deployment helper:
   ```bash
   npm install gh-pages --save-dev
   ```
   Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d out"
   }
   ```
   Run the deployment:
   ```bash
   npm run deploy
   ```
   Your app will be live at `https://yourusername.github.io/atmosphere`!
