import React from 'react'; 
import { useState, useRef, useEffect } from 'react';
import Overview from './Overview';
import HourlyList from './HourlyList';
import CurrentConditions from './CurrentConditions';
import './weather.css';
import '../index.css';
import '../App.css';
import './days.css';

const Days = ({
    data,  Overview, RecentSearches, setData,
    HourlyList, dayIndex, indexHour, setIndexHour, 
    address, recentSearch, showSetting, settingsZ,
    setRecentSearch, setSettingZ, CurrentConditions,
    onPageUpdate, defaultTempUnit, tempSymbol, 
    hourMinFormat, precipType, 
    bearingConversion, getHumidityColor, 
    toKiloM, getHumidityBGColor, getHumidityTxtColor, 
    baroPercent, UVLevel, bttmAlign, 
    getPhaseType, getPhaseInfo  

} ) => {
    const pageRef = useRef([]);
    const hourInfoRef = useRef([]);

    const iconBasePath = '/GWeatherIcons/';

    useEffect(() => {
        const timezone = data.timezone;
        console.log(timezone);
    
        const currentTime = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            hour12: false // Use 24-hour format, set to true for 12-hour format
        }).format(new Date());
    
        function parseCurrentTime(time) {
            if (time.charAt(0) == 0) {
                console.log('yes theres a zero in front');
                const parsedTime = time.slice(1);
                return parsedTime;
            } else {
                return time;
            }
        }
    
        const currentHour = parseCurrentTime(currentTime);
    
        console.log(currentHour);
        setIndexHour(currentHour);
    
    }, [data])

    function defaultPage() {
        onPageUpdate(false);
    }

    const showCurrentHour = () => {
        if (hourInfoRef.current.length > 0) {
            const indexHour = new Date().getHours(); // Replace with your logic for the current hour
            hourInfoRef.current[indexHour]?.scrollIntoView({
                behavior: 'instant',
                block: 'nearest',
                inline: 'start',
            });
            pageRef.current.scrollIntoView(
                {
                    behavior: 'instant',
                    block: 'center',
                }
            )
        }
    };
    useEffect(() => {showCurrentHour()}, [data]);

    const dates = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    };

    const formatFullDay = (numDay) => {
        const day = new Date(numDay);
        const realDate = new Intl.DateTimeFormat('en-US', dates).format(day);
        return realDate;
    };

    return (
        <div className='weather-days-app bg-[rgba(249,249,251,.3)]'>
            <div className="back-to absolute pt-4 h-fit ms-4" 
            onClick={() => {defaultPage()}}
            ref={pageRef}> 
                <img src='/icons8-back-24.png' alt="" srcSet="" /> 
            </div>

            <div className="day-elements top-0 pt-4 justify-self-center md:max-w-3/5 grid grid-cols-1 row-auto justify-items-center h-full gap-5">
                <div className="day-dated relative text-teal-900 text-xl leading-snug"> {formatFullDay(data.days[dayIndex].datetime)}</div>
                
                <Overview 
                  data={data} dayIndex={dayIndex} 
                  indexHour={indexHour} defaultTempUnit={defaultTempUnit}
                  tempSymbol={tempSymbol} />
                  
                <HourlyList 
                  data={data} dayIndex={dayIndex} indexHour={indexHour}
                  setIndexHour={setIndexHour} setRecentSearch={setRecentSearch} 
                  setSettingZ={setSettingZ}
                  defaultTempUnit={defaultTempUnit} hourTimeRef={hourInfoRef}
                  hourInfoRef={hourInfoRef}
                  tempSymbol={tempSymbol}  
                  hourMinFormat={hourMinFormat}/>

                <CurrentConditions 
                  data={data} dayIndex={dayIndex} indexHour={indexHour}
                  formatFullDay={formatFullDay} defaultTempUnit={defaultTempUnit}
                  showCurrentHour={showCurrentHour} hourMinFormat={hourMinFormat} 
                  precipType={precipType} 
                  getHumidityBGColor={getHumidityBGColor}
                  getHumidityColor={getHumidityColor}
                  getHumidityTxtColor={getHumidityTxtColor}
                  bearingConversion={bearingConversion}
                  toKiloM={toKiloM}
                  baroPercent={baroPercent}
                  UVLevel={UVLevel}
                  bttmAlign={bttmAlign}
                  getPhaseType={getPhaseType}
                  getPhaseInfo={getPhaseInfo}/>

                <div className="recents">
                    <RecentSearches 
                    data={data} setData={setData} 
                    indexHour={indexHour} address={address}
                    recentSearch={recentSearch} showSetting={showSetting}
                    setRecentSearch={setRecentSearch}
                    setIndexHour={setIndexHour}
                    dayIndex={dayIndex} settingsZ={settingsZ}
                    setSettingZ={setSettingZ} 
                    defaultTempUnit={defaultTempUnit} 
                    tempSymbol={tempSymbol}
                    />
                </div>

            </div>
        </div>
    );
    
} 

export default Days;