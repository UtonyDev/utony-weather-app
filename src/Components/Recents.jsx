import "./weather.css";
import "../App.css";
import "../index.css";
import React, { forwardRef, useEffect, useState, useRef } from "react";
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
      checkCountry,
      tabWidth,
      getTabWidth,
    },
    ref // Forwarded ref from parent
  ) => {
    const [locationsData, setLocationsData] = useState([]);
    const [currentKey, setCurrentKey] = useState(0);
    const [preferedKey, setPreferedKey] = useState('');
    const [locationKey, setLocationKey] = useState(0);
    const [fallBackKey, setFallBackKey] = useState('');
    const [backupKey, setBackupKey] = useState('');
    const weatherCacheKey = "weatherCache";
    const { tabRef, recentsRef } = ref;

    let userPreferedCountry = localStorage.getItem("savedKey") || {};
    let userPreferedKey = String(userPreferedCountry)
    .replace(/"/g, "");
      
    console.log(userPreferedKey);
    let cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
    let fallbackCountry = fallBackKey.split(":")


    useEffect(() => {
      if (!defaultTempUnit) return; // Ensure function exists before running
      setPreferedKey(userPreferedKey);

      // Highlights the current location.
      if (Object.keys(cachedData).length > 0) {
        setFallBackKey(Object.keys(cachedData).at(-1));
        console.log(fallBackKey);
        if (locationKey === 0 && preferedKey === 0) {
          console.log('the default location is in use ')
            setLocationKey(Object.keys(cachedData).at(-1));
      } else if (preferedKey) {
          console.log('using the formally set location by user');
          setLocationKey(backupKey);
        } else {
          console.log('the user selected location is in use ');
          setLocationKey(currentKey);
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
              location: key + " ",
              temp: defaultTempUnit(latestData.days[dayIndex].hours[indexHour].temp),
              precipProb: latestData.days[dayIndex].hours[indexHour].precipprob,
              icon: `/GWeatherIcons/${latestData.days[dayIndex].hours[indexHour].icon}.png`,
            };
          })
          .filter(Boolean);
        
        setLocationsData(locationsArray);
      }
    }, [data, defaultTempUnit]);

    const saveLocation = (savedKey) => {
      if (currentKey === 0) {
        const initialLocation = savedKey;
        setPreferedKey(initialLocation);
        console.log("the initial key is:", initialLocation);
        localStorage.setItem("savedKey", JSON.stringify(initialLocation));  
      } else {
        const savedLocation = savedKey;
        setPreferedKey(savedLocation);
        console.log("the current key is:", savedLocation);
        localStorage.setItem("savedKey", JSON.stringify(savedLocation));  
      }
    }

    const removeLocation = (pickedLocation) => {
      console.log(cachedData[pickedLocation]);
      const itemToBeRemoved = pickedLocation;
      cachedData[itemToBeRemoved] = {};
      delete cachedData[itemToBeRemoved];
      localStorage.setItem("weatherCache", JSON.stringify(cachedData));

      console.log("fallback key is", fallBackKey);
      
      const newData = cachedData[fallBackKey];
      if (newData) {
        setData(newData);
        checkCountry(fallbackCountry[fallbackCountry.length - 1]);
      }
    }

    useEffect(() => {
      if (userPreferedKey) {
        setBackupKey(userPreferedKey.trim());
      }
    }, [])
  
  useEffect(() => {
      getTabWidth();
      window.addEventListener('resize', getTabWidth);
      window.addEventListener('load', getTabWidth);
  
      return () => {
        window.removeEventListener('resize', getTabWidth);
      };
    }, [tabRef.current]);

    return (
      <div
        className={`recents-tab top-0 left-[0] min-w-full fixed h-screen place-self-center bg-[#e5e5e5] md:bg-[#e5e5e580] md:relative md:w-[40vw] md:mx-0 md:max-h-[532px] md:left-x-[0%] p-4 z-[150] overflow-y-scroll`}
        ref={recentsRef}
      >
        <div className="desc md:text-[17px] text-lg flex bg-[#e5e5e5] md:bg-transparent w-full h-fit font-medium text-[#404C4F]">
          <img
            loading="lazy"
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
        <div className="locations relative flex flex-col-reverse">
          {locationsData.map(
            ({ key, cachedData, location, temp, precipProb, icon }, index) => (
              <div key={key}>
              <div
                key={key}
                onClick={() => {
                  console.log("the main key is", key);
                  const selectedLocationData = cachedData[key];
                  setCurrentKey(key);
                  setData(selectedLocationData);
                  const currentCountry = key.split(':');
                  checkCountry(currentCountry[currentCountry.length - 1]);
                  console.log(currentKey);
                  setLocationKey(key);
                  setBackupKey(key)
                  console.log('the location key is', locationKey);
                  hideRecentSearch();
                }}
                ref={tabRef}
                className={`location-tab bg-[#F9F9FB] p-2 rounded-lg border-1 border-gray-200 my-2 z-20`}
                style={{
                    backgroundColor: locationKey === key ? '#d7f3ed' : '#F9F9FB', 
                }}>
                <h3 className="title mb-3 text-neutral-700 font-normal">
                  {location}
                </h3>
                <div className="location-Info w-full">
                  <span className="left-info flex flex-row">
                    <span className="location-temp font-medium text-teal-600">
                      {temp}
                      {tempSymbol()}
                    </span>
                    <span className="location-precip text-neutral-600 text-end ms-2">
                        {Math.round(precipProb)}%
                      </span>
                      <img
                        loading="lazy"
                        className="location-img size-5 ms-2"
                        src={icon}
                        alt="Weather icon"
                      />
                    </span>
                </div>

              </div>

              <div key={location} className="location-actions relative ">
                <span className={`right-info absolute -translate-y-10 flex flex-row justify-end z-30`}style={{
                  transform: `translateX(${tabWidth}px)`,
                }}>
                <span className="delete-butn me-1 size-4"
                 onClick={() => {
                  removeLocation(location.trim());
                 }}
                 style={{
                  display: currentKey === location.trim() ? "none" : "block",
                 }}>
                   <img loading="lazy" src={`trash.png`} alt="" className="size" /> </span>
                <span className="save ms-1 size-4"
                onClick={() => {
                  console.log("the location key is", location)
                  saveLocation(location);
                  console.log(preferedKey);
                  }}> <img loading="lazy" src={preferedKey === location ? `fav-filled.png` : `fav-blank.png` } alt="" srcSet="" /> </span>
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