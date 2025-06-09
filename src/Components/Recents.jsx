import "./weather.css";
import "../App.css";
import "../index.css";
import React, { forwardRef, useEffect, useState, useRef } from "react";

const RecentSearches = forwardRef(
  (
    {
      data,
      defaultTempUnit,
      tempSymbol,
      dayIndex,
      indexHour,
      setSettingZ,
      hideRecentSearch,
      checkCountry,
      tabWidth,
      getTabWidth,
      address,
      setAddress,
      setDisplayAddress,
      currentKey, 
      setCurrentKey,
      query,
      setQuery
    },
    ref // Forwarded ref from parent
  ) => {
    const [locationsData, setLocationsData] = useState([]);
    const [preferedKey, setPreferedKey] = useState('');
    const [fallBackKey, setFallBackKey] = useState('');
    const { tabRef, recentsRef } = ref;

    let userPreferedLocation = localStorage.getItem("savedKey") || [];
    let userPreferedKey = String(userPreferedLocation).replace(/"/g, "").trim(); 
    console.log(userPreferedKey);

    let cachedData = JSON.parse(localStorage.getItem("weatherCache")) || {};

    useEffect(() => {
      if (Object.keys(cachedData).length > 0) {
        setFallBackKey(currentKey);
        console.log("CURRENT KEY",address.replace(/,\s*([^,]*)$/, ':$1'))
        localStorage.setItem('currentAddress', address);
        
        if (localStorage.getItem('currentAddress')
        === address && userPreferedLocation.length === 0) {
          console.log("highlighting current item");
          setCurrentKey(address.replace(/,\s*([^,]*)$/, ':$1'));
          localStorage.setItem('currentAddress', address);
        } else if (userPreferedLocation.length > 0 || userPreferedKey === preferedKey) {
          console.log('using the user favourite location.')
          setCurrentKey(userPreferedKey);
          localStorage.setItem('currentAddress', userPreferedKey);
        } 
      }
    }, []);

    console.log('the current key from the CACHE is ', currentKey);

    useEffect(() => {
      if (!defaultTempUnit) return; // Ensure function exists before running
      setPreferedKey(userPreferedKey);

      // Highlights the current location.
      if (Object.keys(cachedData).length > 0) {
        const locationsArray = Object.keys(cachedData)
          .map((key) => {
            let latestData = cachedData[key].storedData;

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
        const initialLocation = savedKey.trimEnd();
        setPreferedKey(initialLocation);
        console.log("the initial key is:", initialLocation);
        localStorage.setItem("savedKey", JSON.stringify(initialLocation));  
      } else {
        const savedLocation = savedKey.trimEnd();
        setPreferedKey(savedLocation);
        console.log("the current key is:", savedLocation);
        localStorage.setItem("savedKey", JSON.stringify(savedLocation));  
      }
    }


    const removeLocation = (pickedLocation) => {
      const cachedData = JSON.parse(localStorage.getItem("weatherCache")) || {};
      delete cachedData[pickedLocation];
      localStorage.setItem("weatherCache", JSON.stringify(cachedData));

      const updatedLocations = locationsData.filter(
        (location) => location.key !== pickedLocation
      );
      setLocationsData(updatedLocations);
      setDisplayAddress(fallBackKey.replace(":", ","));

      if (currentKey === pickedLocation) {
        const fallbackKey = updatedLocations.length > 0 ? updatedLocations[0].key : "";
        setCurrentKey(fallbackKey);
        setAddress(fallbackKey.replace(":", ","));
        setDisplayAddress(fallbackKey.replace(":", ","));
        const fallbackCountry = fallbackKey.split(":").at(-1);
        checkCountry(fallbackCountry);
      }

      if (preferedKey === pickedLocation) {
        localStorage.removeItem("savedKey");
        setPreferedKey("");
      }
    };

    console.log('our currentKey now is? ', currentKey);
    console.log('our FallbackKey now is? ', fallBackKey);
  
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
                onClick={ async () => {
                  console.log("the main key is", key);
                  setCurrentKey(key);
                  localStorage.setItem('currentAddress', key);
                  await setAddress(key.replace(':', ','));
                  await setDisplayAddress(key.replace(':', ','));
                  await setQuery(key.replace(':', ','))
                  const currentCountry = key.split(':');
                  checkCountry(currentCountry[currentCountry.length - 1]);
                  console.log(currentKey);
                  hideRecentSearch();
                }}
                ref={tabRef}
                className={`location-tab bg-[#F9F9FB] p-2 rounded-lg border-1 border-gray-200 my-2 z-20`}
                style={{
                    backgroundColor: currentKey === key ? '#ECF8F7' : '#F9F9FB',
                    borderColor: currentKey === key ? "#1B5A4D" : "",
                }}>
                <h3 
                 className="title mb-3 font-normal"
                 style={{
                  color: currentKey === key ? '#1B5A4D' : '#404040',
                 }}>
                  {location.replace(/:/g, ", ")}
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
                  console.log("the location is", location)
                  saveLocation(location);
                  console.log(preferedKey);
                  }}> <img loading="lazy" src={preferedKey === location.trimEnd()  ? `fav-filled.png` : `fav-blank.png` } alt="" srcSet="" /> </span>
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