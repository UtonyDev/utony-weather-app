import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WeatherApp from './WeatherApp.jsx'
import './index.css'
import './weatherapp.css';

createRoot(document.getElementById('root')).render(
    <WeatherApp />
)
