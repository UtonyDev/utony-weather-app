import "./weather.css";
import "../App.css";
import "../index.css";
import React, { forwardRef, useEffect, useState } from "react";
import { px } from "framer-motion";

const RecentSearches = forwardRef(
  (
    {
      data,
      setData,
      defaultTempUnit,
      tempSymbol,
      dayIndex,
      indexHour,
      setSettingZ,
      hideRecentSearch,
      showRecentSearch,
    },
    ref // Forwarded ref from parent
  ) => {
    const [locationsData, setLocationsData] = useState([]);
    const [currentKey, setCurrentKey] = useState(0);
    const [defaultKey, setDefaultKey] = useState(0);
    const [locationKey, setLocationKey] = useState(0);
    const weatherCacheKey = "weatherCache";

    useEffect(() => {
      if (!defaultTempUnit) return; // Ensure function exists before running

      const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};

      if (Object.keys(cachedData).length > 0) {
        console.log(Object.keys(cachedData).at(-1));
        if (locationKey === 0) {
            setLocationKey(Object.keys(cachedData).at(-1));
        }
        const locationsArray = Object.keys(cachedData)
          .map((key) => {
            let latestData = cachedData[key];

            if (
              !latestData ||
              !latestData.days?.[dayIndex]?.hours?.[indexHour]?.temp
            )
              return null;

            return {
              key,
              cachedData,
              location: key.replace(":", ", "),
              temp: defaultTempUnit(latestData.days[dayIndex].hours[indexHour].temp),
              precipProb: latestData.days[dayIndex].hours[indexHour].precipprob,
              icon: `/GWeatherIcons/${latestData.days[dayIndex].hours[indexHour].icon}.png`,
            };
          })
          .filter(Boolean);
        
        setLocationsData(locationsArray);
      }
    }, [data, defaultTempUnit]);

    const highlightLocation = () => {
        setLocationKey(currentKey);
    }

    return (
      <div
        className={`recents-tab top-0 left-[0] min-w-full fixed h-screen place-self-center bg-[#e5e5e5] md:bg-[#e5e5e580] md:relative md:w-[40vw] md:mx-0 md:max-h-[532px] md:left-x-[0%] p-4 z-[150] overflow-y-scroll`}
        ref={ref} // Assign the forwarded ref to the div
      >
        <div className="desc text-[17px] h-fit font-medium text-[#404C4F]">
          <img
            src="./icons8-back-24.png"
            alt=""
            className="back-to size-5  me-3  self-center md:hidden"
            onClick={() => {
              hideRecentSearch();
              setSettingZ(false);
            }}
          />{" "}
          Recently Searched
        </div>
        <div className="locations flex flex-col-reverse">
          {locationsData.map(
            ({ key, cachedData, location, temp, precipProb, icon }, index) => (
              <div
                key={key}
                onClick={() => {
                  console.log(key);
                  const selectedLocationData = cachedData[key];
                  setCurrentKey(key);
                  setData(selectedLocationData);
                  setLocationKey(key)
                  hideRecentSearch();
                  setDefaultKey(false);
                  console.log(currentKey);
                }}
                className={`location-tab bg-[#F9F9FB] p-2 rounded-lg border-1 border-gray-200 my-2`}
                style={{
                    backgroundColor: locationKey === key ? '#d7f3ed' : '#F9F9FB', 
                    
                }}
              >
                <h3 className="title mb-3 text-neutral-700 font-normal">
                  {location}
                </h3>
                <div className="location-Info w-full flex justify-between">
                  <span className="location-temp text-teal-600">
                    {temp}
                    {tempSymbol()}
                  </span>
                  <span className="right-info flex flex-row">
                    <span className="location-precip text-neutral-600 text-end mx-1">
                      {precipProb}%
                    </span>
                    <img
                      className="location-img size-5 justify-end ms-2"
                      src={icon}
                      alt="Weather icon"
                    />
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);

export default RecentSearches;