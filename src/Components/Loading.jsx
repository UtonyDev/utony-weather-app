import { useState, useRef, useEffect } from "react";
import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import "./weather.css";
import "../App.css";
import "../index.css";
import { address } from "framer-motion/client";

const Loading  = ({ setPrompt, convertCoordinates, setLoading, address }) => {
    // Automatically get user coordinates.
    const getUserCoordinates = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                // Pass the coordinate to weatherapp.
                console.log("Converting Coords to address...");
                await convertCoordinates(latitude, longitude);
                // Remove prompt 7 loading screen.               
                setLoading(false);
                setPrompt(false);
                // Log coordinates.
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
              },

              (error) => {
                // Log error if any.
                console.error("Error getting location:", error.message);
              }
            );

          } else {
            // Log browser related error.
            console.error("Geolocation is not supported by this browser.");
          }
    }
    useEffect(() => {getUserCoordinates();}, []);
    

return (
    <div className="bg-white place-items-center relative grid w-full h-screen">
        <span className="absolute top-1/3 ">
            <img src="rain-gif.gif" className='size-20'/>
            </span>
            <div className="plead-message absolute top-[55%]">
            Getting Location...
            </div>
    </div>
)
}
export default Loading;