import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
  } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import WeatherApp from './WeatherApp.jsx'
import './index.css'
import './App.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <WeatherApp />
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
)
