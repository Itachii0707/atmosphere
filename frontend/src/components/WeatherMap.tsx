'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getStoredOwmApiKey, getStoredApiKey, getStoredRecents } from '../utils/storage';
import { Loader2 } from 'lucide-react';

// Fix for default marker icons in Leaflet with Webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to recenter map when coordinates change
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function WeatherMap() {
  const DEFAULT_OWM_KEY = 'da1c086ddda007363c29ff8e2ade5323';
  const [owmKey, setOwmKey] = useState(DEFAULT_OWM_KEY);
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London
  const [cityName, setCityName] = useState('London');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get OWM Key
    const storedOwmKey = getStoredOwmApiKey();
    // eslint-disable-next-line
    if (storedOwmKey) setOwmKey(storedOwmKey);

    // 2. Fetch coordinates for the most recently searched city
    const recents = getStoredRecents();
    const cityToFetch = recents.length > 0 ? recents[0] : 'London';
    
    const fetchCityCoords = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const weatherApiKey = getStoredApiKey() || '';
        
        let url = `${backendUrl}/api/weather?q=${encodeURIComponent(cityToFetch)}`;
        if (weatherApiKey) {
          url += `&key=${encodeURIComponent(weatherApiKey)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch city data');
        
        const data = await response.json();
        
        if (data && data.location && data.location.lat && data.location.lon) {
          setCenter([data.location.lat, data.location.lon]);
          setCityName(data.location.name);
        }
      } catch (err) {
        console.error('Error fetching map center:', err);
        setError('Could not locate city. Using default map center.');
      } finally {
        setLoading(false);
      }
    };

    fetchCityCoords();
  }, []);

  const getOwmTileUrl = (layer: string) => {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${owmKey}`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neo-blue border-4 border-black shadow-brutal-lg">
        <div className="flex flex-col items-center gap-4 p-8 bg-neo-yellow border-4 border-black shadow-brutal-sm animate-pulse">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black font-heading text-xl">LOADING MAP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative z-0 border-4 border-black shadow-brutal-lg overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neo-pink text-black px-4 py-2 border-2 border-black font-bold text-sm shadow-brutal-sm">
          {error}
        </div>
      )}
      
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-0"
        style={{ background: '#000' }}
      >
        <ChangeView center={center} zoom={6} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Dark Map" checked>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* OWM Weather Overlays */}
          <LayersControl.Overlay name="Temperature" checked>
            <TileLayer
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              url={getOwmTileUrl('temp_new')}
              opacity={0.8}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Precipitation">
            <TileLayer
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              url={getOwmTileUrl('precipitation_new')}
              opacity={0.8}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Clouds">
            <TileLayer
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              url={getOwmTileUrl('clouds_new')}
              opacity={0.8}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Wind Speed">
            <TileLayer
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              url={getOwmTileUrl('wind_new')}
              opacity={0.8}
            />
          </LayersControl.Overlay>
        </LayersControl>

        <Marker position={center}>
          <Popup>
            <div className="font-bold text-black text-center">
              {cityName}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
