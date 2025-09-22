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
      setQuery,
      displayAddress,
    },
    ref // Forwarded ref from parent
  ) => {
    const [locationsData, setLocationsData] = useState([]); 
    const [preferedKey, setPreferedKey] = useState('');
    const [fallBackKey, setFallBackKey] = useState('');
    const [isLocationPinned, setIsLocationPinned] = useState(false);
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
    // 
    useEffect(() => {
      if (!defaultTempUnit) return; // Ensure function exists before running
      setPreferedKey(userPreferedKey);

      // Highlights the current location.
      if (Object.keys(cachedData).length > 0) {
        const locationsArray = Object.keys(cachedData)
          .map((key) => {
            // Use the key to access the corresponding data in cachedData within storedData.
            let latestData = cachedData[key].storedData;

            if (
              !latestData ||
              !latestData.days?.[dayIndex]?.hours?.[indexHour]?.temp
            )
              return null;
            let temp = defaultTempUnit(latestData.days[dayIndex].hours[indexHour].temp);

            return {
              key,
              location: key + " ",
              temp,
              precipProb: latestData.days[dayIndex].hours[indexHour].precipprob,
              icon: `/GWeatherIcons/${latestData.days[dayIndex].hours[indexHour].icon}.png`,
            };
          })
          .filter(Boolean);
        console.log("SET the LOCATIONS DATA STATE with: ", locationsArray);
        setLocationsData(locationsArray);
        localStorage.setItem("storedLocations", JSON.stringify(locationsArray));
        console.log("INITIALIZED Recents STORED to localStorage");

      }
    }, [data]);
    //const storedLocations = (localStorage.getItem("storedLocations")) || {}
    // console.log("the stored locations are: ", storedLocations );
    let storedLocations = JSON.parse(localStorage.getItem("storedLocations")) || [];
    console.log("the stored recent locations are: ", storedLocations );
    
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

    if (locationsData.length > 5) {
        removeLocation(locationsData[locationsData.length - 1].key);
        console.log("Recents EXCEEDED, last search removed");
        setLocationsData([...locationsData]);
        localStorage.setItem("storedLocations", JSON.stringify(locationsData));
    } 
    // Function to pin the selected location to the top of the list.
    const pinLocation2Top = (fromI) => {
      let selectedLocation = locationsData[fromI];
      console.log("The Selected Location is: ", selectedLocation, " at index ", fromI);
      locationsData[fromI] = locationsData[locationsData.length - 1];
      locationsData[locationsData.length - 1] = selectedLocation;
      console.log("The Selected Location : ", selectedLocation, " is NOW at index ", fromI);
      console.log("The Rearranged Locations are: ", locationsData);
      // Set the rearranged locations to state.
      setLocationsData([...locationsData]);
      // Log the rearranged locations to LocalStorage.
      localStorage.setItem("storedLocations", JSON.stringify(locationsData));
    }

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
        <div className="currentLocation">
            {locationsData.length >= 0 && 
            (
              <>
              <div className="currentText md:text-[17px] text-lg flex bg-[#e5e5e5] md:bg-transparent w-full h-fit font-medium text-[#404C4F]">
                <img
            loading="lazy"
            src="./icons8-back-24.png"
            alt=""
            className="back-to size-5 me-3 self-center md:hidden"
            onClick={() => {
              hideRecentSearch();
              setSettingZ(false);
            }}
          />{" "}
             Your Location 
             <span className="your">
              <img  src="./icons8-search-location-48.png" alt=""  className="back-to size-5 mt-1 " srcSet="" />
             </span>
              </div>
                <div className="YourLocationTab bg-[#F9F9FB] p-2 rounded-lg border-1 border-gray-200 my-2 z-20"
                onClick={ async () => {
                  console.log("User selected DEFAULT Location: ", locationsData[0]?.key);
                  setCurrentKey(locationsData[0]?.key);
                  localStorage.setItem('currentAddress', locationsData[0]?.key);
                  await setAddress(locationsData[0]?.key.replace(':', ','));
                  localStorage.setItem("address", locationsData[0]?.key.replace(':', ','));
                  await setDisplayAddress(locationsData[0]?.key.replace(':', ', '));
                  console.log("the display address on the SEARCH BAR: ",displayAddress);
                  await setQuery(locationsData[0]?.key.replace(':', ', '))
                  const currentCountry = locationsData[0]?.key.split(':');
                  checkCountry(currentCountry[currentCountry.length - 1]);
                  console.log(currentKey);
                  hideRecentSearch();
                }}
                style={{
                    backgroundColor: currentKey === locationsData[0]?.key ? '#ECF8F7' : '#F9F9FB',
                    borderColor: currentKey === locationsData[0]?.key ? "#1B5A4D" : "",
                    color: currentKey === locationsData[0]?.key ? '#1B5A4D' : '#404040',
                }}
                >
                  <div className="yourLocationName mb-3">
                    {locationsData[0]?.key.replace(':', ', ')}
                  </div>

                  <div className="yourLocationInfo w-full">
                  <span className="left-info flex flex-row">
                    <span className="location-temp font-medium text-teal-600">
                      {locationsData[0]?.temp}
                      {tempSymbol()}
                    </span>
                    <span className="location-precip text-neutral-600 text-end ms-2">
                        {Math.round(locationsData[0]?.precipProb)}%
                      </span>
                      <img
                        loading="lazy"
                        className="location-img size-5 ms-2"
                        src={locationsData[0]?.icon}
                        alt="Weather icon"
                      />
                    </span>
                </div>
                </div>
              </>
            )} 
        </div>
        <div className="desc md:text-[17px] text-lg flex bg-[#e5e5e5] md:bg-transparent w-full h-fit font-medium text-[#404C4F]">
          Recently Searched
        </div>
        <div className="locations relative flex flex-col-reverse">
          

          {locationsData.length > 1 && locationsData.map(
            ({ key, location, temp, precipProb, icon }, i, allLocations) => i !== 0 ? (

              <div key={key}>
              <div
                key={key}
                onClick={ async () => {
                  console.log("the main key is", key);
                  setCurrentKey(key);
                  localStorage.setItem('currentAddress', key);
                  await setAddress(key.replace(':', ','));
                  localStorage.setItem("address", key.replace(':', ','));
                  await setDisplayAddress(key.replace(':', ', '));
                  console.log("the display address on the SEARCH BAR: ",displayAddress);
                  await setQuery(key.replace(':', ', '));
                  const currentCountry = key.split(':');
                  checkCountry(currentCountry[currentCountry.length - 1]);
                  console.log(currentKey);
                  console.log("The MAPPED all locations are: ", allLocations);
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

                 {/** Bar to showcase Temperature, Precipitation Probability, & weather condition icon */}
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
              {/** Actions to set favorite and deleted location. */}
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

                <span className="pin ms-1 size-4"
                onClick={() => {
                  console.log("the PINNED location is", location);
                  console.log("The PREFERRED KEY is ", preferedKey);
                  pinLocation2Top(i);
                  console.log(preferedKey);
                  }}> <img loading="lazy" src={locationsData[locationsData.length - 1].key === location.trimEnd()  ? `pin-filled.png` : `pin-blank.png` } alt="" srcSet="" /> </span>
                </span>
             </div>
             </div>
            ) : (null)
          ).filter(Boolean)}
        </div>
      </div>
    );
  }
);

export default RecentSearches;