import { useState, useRef, useEffect, useMemo } from 'react'
import React from 'react';
import './weather.css';
import '../index.css';
import '../App.css';

const LocationForm = React.memo(({ address, setAddress, setPrompt, convertCoordinates }) => {
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if city and country are not empty
        if (!city || !country) {
            alert("Please enter both city and country");
            return;
        }
        const cacheAddress = `${city},${country}`;
        console.log("the address from the form is",cacheAddress);
        setAddress(cacheAddress);
        localStorage.setItem('address', cacheAddress);
    }

    const getUserCoordinates = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;

                await convertCoordinates(latitude, longitude);
                setPrompt(false);
                
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
              },
              (error) => {
                console.error("Error getting location:", error.message);
              }
            );
          } else {
            console.error("Geolocation is not supported by this browser.");
          }
    }

        return (
        <div className='relative grid place-items-center h-screen align-center'>

<div className="form-container grid sm:w-[90vw] sm:h-[60vh] md:max-w-[45vw] md:h-fit bg-white shadow-lg rounded-xl py-2 gap-2">
    <img loading="lazy" src="/icons8-place-marker-48.png" alt="location icon" className='block place-self-center'/>
    <label className="text-[#0a0a0a] place-self-center text-2xl flex items-center gap-2">
        Enter Location
    </label>

    <form onSubmit={handleSubmit} className="grid row-auto gap-2">
            <input
                className=" p-3 rounded-xl border mx-4 my-2 bg-neutral-100 border-zinc-200 outline-none focus:bg-gray-50 text-gray-500 text-lg"
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />

            <input
                className=" p-3 rounded-xl border mx-4 my-2 bg-neutral-100 border-zinc-200 outline-none focus:bg-gray-50 text-gray-500 text-lg"
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
            />

        <button className="mx-4 my-2 p-3 bg-teal-600 rounded-md text-zinc-50 text-lg hover:bg-teal-700 active:opacity-70 shadow-md hover:shadow-lg" type="submit">
            Submit Location
        </button>
    </form>

    <hr className="border border-zinc-300 my-2 w-[90%] place-self-center" />

        <button className="mx-4 py-2  bg-teal-600 rounded-md text-zinc-50 text-lg hover:bg-teal-700 active:opacity-70 shadow-md hover:shadow-lg" 
        onClick={getUserCoordinates}>
            Auto-Detect Location
        </button>
        <div className="act"></div>
    </div>
        </div>
    );
    });

export default LocationForm;