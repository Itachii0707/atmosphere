import os
from fastapi import FastAPI, Query, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Atmosphere Weather API",
    description="Python FastAPI backend for Atmosphere, fetching and enriching weather and air quality data.",
    version="1.0.0"
)

# Enable CORS for frontend requests
# Set ALLOWED_ORIGINS env var in production: e.g. "https://your-app.vercel.app"
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Atmosphere API Backend is running"}

@app.get("/api/weather")
async def get_weather(
    q: str = Query(..., description="City name, latitude/longitude (e.g. '48.8567,2.3508'), or postal code"),
    key: Optional[str] = Query(None, description="Optional custom client-side API Key"),
    x_weather_key: Optional[str] = Header(None, description="Optional custom API key in headers")
):
    # 1. Resolve API key: query param -> header -> backend env
    api_key = key or x_weather_key or os.getenv("WEATHER_API_KEY")
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key is missing. Please configure it in your backend .env file or enter it in the frontend settings."
        )
    
    # 2. Call WeatherAPI.com forecast endpoint
    # We query 3 days forecast to cover hourly projections (today + tomorrow)
    url = f"{WEATHER_API_BASE_URL}/forecast.json"
    params = {
        "key": api_key,
        "q": q,
        "days": 3,
        "aqi": "yes",
        "alerts": "yes"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to communicate with weather provider: {str(exc)}"
            )
            
    if response.status_code != 200:
        # WeatherAPI returns error details in JSON
        try:
            err_data = response.json()
            err_msg = err_data.get("error", {}).get("message", "Weather API Error")
            err_code = err_data.get("error", {}).get("code", 0)
            
            # Map common WeatherAPI error codes
            if err_code in [1002, 2006, 2007, 2008]:
                status_code = status.HTTP_401_UNAUTHORIZED
                err_msg = "Invalid API Key. Please verify your credentials."
            elif err_code == 1006:
                status_code = status.HTTP_404_NOT_FOUND
                err_msg = f"Location '{q}' not found. Please check spelling."
            else:
                status_code = response.status_code
        except Exception:
            status_code = response.status_code
            err_msg = "Error fetched from weather service."
            
        raise HTTPException(status_code=status_code, detail=err_msg)
        
    data = response.json()
    
    # 3. Format and enrich payload for Neubrutalist UI
    location = data.get("location", {})
    current = data.get("current", {})
    forecast = data.get("forecast", {}).get("forecastday", [])
    
    # Extract EPA Index and calculate friendly warnings
    aqi_data = current.get("air_quality", {})
    epa_index = aqi_data.get("us-epa-index", 0)
    aqi_label, aqi_desc, aqi_color = get_aqi_details(epa_index)
    
    # Process hourly forecast (next 24 hours, spanning today/tomorrow if needed)
    local_epoch = location.get("localtime_epoch", 0)
    hourly_pool = []
    for day in forecast:
        hourly_pool.extend(day.get("hour", []))
        
    # Filter hours that are at or after the current local time epoch (minus a buffer of 1 hour to show current hour trends)
    upcoming_hours = [
        {
            "time": hr.get("time"),
            "time_epoch": hr.get("time_epoch"),
            "temp_c": hr.get("temp_c"),
            "temp_f": hr.get("temp_f"),
            "condition_text": hr.get("condition", {}).get("text"),
            "condition_icon": hr.get("condition", {}).get("icon"),
            "is_day": hr.get("is_day"),
            "chance_of_rain": hr.get("chance_of_rain"),
            "chance_of_snow": hr.get("chance_of_snow")
        }
        for hr in hourly_pool
        if hr.get("time_epoch") >= (local_epoch - 3600)
    ]
    # Limit to next 24 entries
    upcoming_hours = upcoming_hours[:24]
    
    # Format daily forecast
    daily_forecast = []
    for index, day in enumerate(forecast):
        day_info = day.get("day", {})
        astro_info = day.get("astro", {})
        daily_forecast.append({
            "date": day.get("date"),
            "date_epoch": day.get("date_epoch"),
            "temp_max_c": day_info.get("maxtemp_c"),
            "temp_max_f": day_info.get("maxtemp_f"),
            "temp_min_c": day_info.get("mintemp_c"),
            "temp_min_f": day_info.get("mintemp_f"),
            "avg_temp_c": day_info.get("avgtemp_c"),
            "avg_temp_f": day_info.get("avgtemp_f"),
            "condition_text": day_info.get("condition", {}).get("text"),
            "condition_icon": day_info.get("condition", {}).get("icon"),
            "uv": day_info.get("uv"),
            "max_wind_kph": day_info.get("maxwind_kph"),
            "avg_humidity": day_info.get("avghumidity"),
            "chance_of_rain": day_info.get("daily_chance_of_rain"),
            "sunrise": astro_info.get("sunrise"),
            "sunset": astro_info.get("sunset")
        })
        
    # Return normalized payload
    return {
        "location": {
            "name": location.get("name"),
            "region": location.get("region"),
            "country": location.get("country"),
            "lat": location.get("lat"),
            "lon": location.get("lon"),
            "timezone": location.get("tz_id"),
            "localtime": location.get("localtime"),
            "localtime_epoch": local_epoch
        },
        "current": {
            "temp_c": current.get("temp_c"),
            "temp_f": current.get("temp_f"),
            "feelslike_c": current.get("feelslike_c"),
            "feelslike_f": current.get("feelslike_f"),
            "condition_text": current.get("condition", {}).get("text"),
            "condition_icon": current.get("condition", {}).get("icon"),
            "condition_code": current.get("condition", {}).get("code"),
            "is_day": current.get("is_day"),
            "humidity": current.get("humidity"),
            "wind_kph": current.get("wind_kph"),
            "wind_degree": current.get("wind_degree"),
            "wind_dir": current.get("wind_dir"),
            "visibility_km": current.get("vis_km"),
            "pressure_mb": current.get("pressure_mb"),
            "uv": current.get("uv"),
            "air_quality": {
                "co": aqi_data.get("co"),
                "no2": aqi_data.get("no2"),
                "o3": aqi_data.get("o3"),
                "so2": aqi_data.get("so2"),
                "pm2_5": aqi_data.get("pm2_5"),
                "pm10": aqi_data.get("pm10"),
                "us_epa_index": epa_index,
                "label": aqi_label,
                "desc": aqi_desc,
                "color": aqi_color
            },
            "astro": {
                "sunrise": forecast[0].get("astro", {}).get("sunrise") if forecast else "N/A",
                "sunset": forecast[0].get("astro", {}).get("sunset") if forecast else "N/A"
            }
        },
        "hourly": upcoming_hours,
        "forecast": daily_forecast
    }

def get_aqi_details(epa_index: int):
    # Map US EPA Air Quality Index to Neubrutalist color and label descriptions
    # 1 = Good, 2 = Moderate, 3 = Unhealthy for sensitive groups, 4 = Unhealthy, 5 = Very Unhealthy, 6 = Hazardous
    mapping = {
        1: ("Good", "Air quality is satisfactory, and air pollution poses little or no risk.", "#86efac"), # pastel mint
        2: ("Moderate", "Air quality is acceptable. However, there may be a risk for some people.", "#fef08a"), # pastel yellow
        3: ("Sensitive Groups", "Members of sensitive groups may experience health effects.", "#fed7aa"), # pastel orange
        4: ("Unhealthy", "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.", "#fca5a5"), # pastel red
        5: ("Very Unhealthy", "Health alert: everyone may experience more serious health effects.", "#d8b4fe"), # pastel purple
        6: ("Hazardous", "Health warning of emergency conditions: everyone is more likely to be affected.", "#fda4af") # pastel pink
    }
    return mapping.get(epa_index, ("Unknown", "No air quality data available.", "#e5e7eb"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
