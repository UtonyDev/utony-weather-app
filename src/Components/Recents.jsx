import './weather.css';
import '../App.css';
import '../index.css';
import { useEffect, useState, useRef } from 'react';
import { cache } from 'react';

const RecentSearches = ({ 
    data, setData, defaultTempUnit, tempSymbol,
    dayIndex, indexHour, recentSearch, setRecentSearch, setSettingZ
 }) => {
    const [locationsData, setLocationsData] = useState([]); 
    const [currentKey, setCurrentKey] = useState(null);
    const [defaultKey, setDefaultKey] = useState(true);
    const weatherCacheKey = "weatherCache";

    useEffect(() => {
        if (!defaultTempUnit) return; // Ensure function exists before running

        const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};

        if (Object.keys(cachedData).length > 0) {
            console.log(Object.keys(cachedData).at(-1));
            const locationsArray = Object.keys(cachedData).map((key) => {
                let latestData = cachedData[key];
                
                if (!latestData || !latestData.days?.[dayIndex]?.hours?.[indexHour]?.temp) return null;

                return {
                    key,
                    cachedData,
                    location: key.replace(":", ", "), 
                    temp: defaultTempUnit(latestData.days[dayIndex].hours[indexHour].temp),
                    precipProb: latestData.days[dayIndex].hours[indexHour].precipprob,
                    icon: `/GWeatherIcons/${latestData.days[dayIndex].hours[indexHour].icon}.png`,
                };
            }).filter(Boolean);

            setLocationsData(locationsArray);
        }
    }, [data, defaultTempUnit]); 

    return ( 
        <div className='recents top-0 left-[0] min-w-full fixed h-screen  place-self-center bg-[#f1f1f1] md:w-full md:relative lg:w-[40vw] md:mx-0 md:h-full md:min-h-[500px] md:translate-x-[-100%] p-4 z-[150]'
        style={{
            left: recentSearch ? '0' : '100%',
        }}>
        <div className="desc text-xl font-medium md:h-fit flex text-neutral-600">
            <img src="./icons8-back-24.png" alt="" className="back-to size-5  me-3  self-center md:hidden" 
            onClick={() => {
                setRecentSearch(false)
                setSettingZ(false);
            }}/> Recently Searched</div>
        <div className="locations flex flex-col-reverse">
            
            {locationsData.map(({ key, cachedData, location, temp, precipProb, icon }, index) => (
                <div 
                    key={key}
                    onClick={() => {
                        console.log(key)
                        const selectedLocationData = cachedData[key];
                        setCurrentKey(key);
                        setData(selectedLocationData);
                        setDefaultKey(false);
                        console.log(currentKey);
                    }}
                    className={`location-tab bg-[#F9F9FB] p-2 rounded-lg border-1 border-gray-200 my-2 
                        ${currentKey === key ? "bg-teal-100 border border-teal-400" : ""}
                        ${index === locationsData.length - 1 && defaultKey ? "bg-teal-100 border border-teal-400" : ""}`}
                >
                    <h3 className="title mb-3 text-neutral-700 font-normal">{location}</h3>
                    <div className="location-Info w-full flex justify-between">
                        <span className="location-temp text-teal-600">
                            {temp}{tempSymbol()}
                        </span>
                        <span className="right-info flex flex-row">
                            <span className="location-precip text-neutral-600 text-end mx-1">
                                {precipProb}%
                            </span>
                            <img className="location-img size-5 justify-end ms-2" src={icon} alt="Weather icon" />
                        </span>
                    </div>
                </div>
            ))}
        </div>
        </div>
    );
};
export default RecentSearches;