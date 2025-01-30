import { useState, useEffect, useRef} from 'react';
import { motion } from "framer-motion";
import axios from "axios";
import CurrentConditions from './Components/CurrentConditions';
import HourlyList from './Components/HourlyList';
import Overview from './Components/Overview';
import Days from './Components/Days';
import LocationForm from './Components/LocationForm';
import './Components/weather.css';
import './App.css';
import './index.css';
import 'intersection-observer';

function WeatherApp() {
  const [data, setData] = useState(null);    
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(false); 
  const [error, setError] = useState(null);
  const [indexHour, setIndexHour] = useState(0);
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [holdResult, setHoldResult] = useState('');
  const [chosenIndex, setChosenIndex] = useState(0);
  const [dayPage, setDayPage] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [metricUnit, setMetricUnit] = useState(false);
  const [usUnit, setUSUnit] = useState(false);
  const [ukUnit, setUKUnit] = useState(false);
  const hourInfoRef = useRef([]); 
  const hourTimeRef = useRef([]);
  const dayRef = useRef([]);
  const API_KEY = '124d73669936416ea36f14503e262e7d';
  let userUnitPreference = localStorage.getItem('userUnitPref');

  const InputValChange = async (e) => {
      const value = e.target.value;
      setQuery(value);

      if (value.length > 3) { 
          try {
              const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                  params: {
                      q: value,
                      key: API_KEY,
                      limit: 6, 
                      language: "en",
                  },
              });

              const results = response.data.results.map((result) => result.formatted);
              setHoldResult(results);
              setSuggestions(results);
          
          } catch (error) {
              console.error("Error fetching suggestions:", error);
              alert(error);
          }
          
      } else {
          setSuggestions([]);
      }
  }

  let searchBar = document.querySelector('.search-bar');
  const joinSuggestions = () => {
    if (searchBar) {
    if (suggestions.length >= 1) {
        searchBar.classList.replace('rounded-full', 'rounded-t-lg');
        searchBar.classList.remove('focus:rounded-full');
        searchBar.classList.add('scale-[1.025]');
    } else {
        searchBar.classList.replace('rounded-t-lg', 'rounded-full');
        searchBar.classList.add('focus:rounded-full');
        searchBar.classList.remove('scale-[1.025]');
    }
}
  }

  const unformatLocation = (index) => {
      const chosenList = holdResult[index];
      console.log(chosenList);

     const splitData = chosenList.split(',');
     console.log(splitData)
      if (splitData) {
          const newcity = splitData[dayIndex];
          const newcountry = splitData[splitData.length - 1];
          console.log(newcountry)
          fetchData(newcity, newcountry);
          if (userUnitPreference) {
              checkCountry(userUnitPreference);
              console.log('using user pref');
          } else {
              checkCountry(newcountry);
              console.log('using location');
          }
          console.log('search length is:', splitData.length);
      }
  }

  const resetData = () => {
      localStorage.removeItem('weatherCache');
      localStorage.removeItem('userUnitPref');
      window.location.reload()
  }

  useEffect(() => {
      // Retrieve the weather cache object from localStorage
      const weatherCacheKey = 'weatherCache';
      const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
  
      console.log('Cached data:', cachedData);
  
      // Check if there is any data in the cache
      if (Object.keys(cachedData).length > 0) {
          const latestKey = Object.keys(cachedData)[Object.keys(cachedData).length - 1]; // Get the last added key
          let latestData = cachedData[latestKey];
  
          setData(latestData); // Use the most recent cached data for rendering
          console.log('Using cached data from weatherCache:', latestData);
          console.log(latestData.resolvedAddress);

          console.log('the user prefers: ', userUnitPreference);

          if (userUnitPreference) {
              checkCountry(userUnitPreference);
          } else {
              console.log('user hasnt set preference');
              let cacheLocation = latestData.resolvedAddress.split(',');
              const cacheCountry = cacheLocation[cacheLocation.length -1];
              checkCountry(cacheCountry);    
          }

      } else {
          // No cached data, show the location prompt
          setPrompt(true);
      }
  }, []);

  const iconBasePath = '/GWeatherIcons/';
  useEffect(() => {
      if (data) {
  
          if (data.days && data.days[dayIndex]?.hours) {            
              // Extract user's hour for debugging
              const timeinData = data.days[dayIndex].hours[23].datetime;
              const date = new Date(timeinData * 1000);
              const realTime = new Date();
              const realHour = realTime.getHours();
              const hour = date.getHours();

              // Current duration index being used
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

              const parts = data.resolvedAddress.split(",");
              const coordinates = parts.every(part => !isNaN(part) && part.trim() !== "");
              if (coordinates ) {
                  const resolvedAddress = localStorage.getItem("resolvedAddress");
                  console.log("Resolved Address:", resolvedAddress);
                  console.log("coords address:", address);
                  setAddress(resolvedAddress)
              } else {
                  console.log('use entered address');
                  setAddress(data.resolvedAddress);
              }

              const currentvalue = data.days[dayIndex].hours[currentHour].temp;    
              // Update the state
              console.log(currentHour);
              setIndexHour(currentHour);

          } else {
              console.log('Data structure incomplete or missing days/hours');
          }
      } else {
          console.log('Data is not yet available');
      }

  }, [data]); // Re-run the effect whenever 'data' changes

  // Function to fetch weather data.
  const fetchData = async (city, country) => {
      const cacheKey = `${city}:${country}`;
      const weatherCacheKey = 'weatherCache';
      if (userUnitPreference) {
          checkCountry(userUnitPreference);
          console.log('using user pref');
      } else {
          checkCountry(country);
          console.log('using location');
      }
      
      // Retrieve the cache object from localStorage
      const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
      console.log('Cache key:', cacheKey);
  
      // Check if data for the given city-country pair exists in the cache
      if (cachedData[cacheKey]) {
          const jsonCachedData = cachedData[cacheKey]; 
          setData(jsonCachedData); // Set the state to cached data
          console.log('Using cached weather data:', jsonCachedData);
      } else {
          console.log('Data not found in cache... fetching from server');

      if (chosenIndex) {
          setPrompt(true); 
          console.log('yes', chosenIndex);
      } else {
          setPrompt(false);
          setLoading(true);
          console.log('no', chosenIndex);
      }
          try {
              const response = await fetch(`https://utony-weather-server.onrender.com/api/weather?city=${city}&country=${country}`);

              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
  
              const jsonData = await response.json();
              const storedData = [];
              localStorage.setItem(storedData, jsonData);
              console.log('new stored data', storedData)
              // Update the cache object with new data

              cachedData[cacheKey] = jsonData;
              localStorage.setItem(weatherCacheKey, JSON.stringify(cachedData)); // Save the updated cache to localStorage
  
              setData(jsonData); // Set the fetched data to state
              console.log('Fetched data from server:', jsonData);

          } catch (err) {
              console.error('Error fetching weather data:', err);
              setError(err.message); // Handle network error
          } finally {
              setPrompt(false); // End prompt state
              setLoading(false);

          }
      }
  };

  const convertCoordinates = async (latitude, longitude) => {
      const apiKey = '124d73669936416ea36f14503e262e7d';

      const url = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}%2C+${longitude}&pretty=1&no_annotations=1`;

      fetch(url)
      .then(response => response.json())
      .then(data => {
          if (data.results.length > 0) {
          const city = `${data.results[dayIndex].components._normalized_city}, ${data.results[dayIndex].components.state},`;
          const country = `${data.results[dayIndex].components.country}`;
          console.log(country);
          checkCountry(country);

          const resolvedAddress = `${city}${country}`;
          localStorage.setItem("resolvedAddress", resolvedAddress);
          setAddress(resolvedAddress);
          fetchData(city, country);
          console.log(resolvedAddress);
          } else {
          console.log('No results found.');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }

  function waitForCheckboxes(timeout = 10000) {
      return new Promise((resolve, reject) => {
          const startTime = Date.now();
  
          function check() {
              const customCheckBox1 = document.querySelector('.custom-checkbox1');
              const customCheckBox2 = document.querySelector('.custom-checkbox2');
  
              if (customCheckBox1 && customCheckBox2) {
                  resolve({ customCheckBox1, customCheckBox2 });
              } else if (Date.now() - startTime > timeout) {
                  reject(new Error("Checkboxes did not load within the timeout period."));
              } else {
                  setTimeout(check, 100); // Check again in 100ms
              }
          }
  
          check();
      });
  }

  function checkActionCels() {
      checkCountry('metric');
      localStorage.setItem('userUnitPref', 'metric');
      const userPref = localStorage.getItem("userUnitPref");
      console.log(userPref)
  }

 function checkActionFahr() {
      checkCountry('us');
      localStorage.setItem('userUnitPref', 'us');
      const userPref = localStorage.getItem("userUnitPref");
      console.log(userPref)
 }

  async function checkCountry(countries) {
      try {
          // Wait for checkboxes to exist
          const { customCheckBox1, customCheckBox2 } = await waitForCheckboxes();
  
          const theUSA = ' United States of America';
          const theus = 'us';
          const theUS = ' United States';
          const theUKE = 'England';
          const theUK = 'United Kingdom';
  
          if (countries === theUS || countries === theUSA || countries === theus) {
              setUSUnit(true);
              setUKUnit(false);
              setMetricUnit(false);
              customCheckBox1.checked = false;
              customCheckBox2.checked = true;
              console.log('In the US');
          } else if (countries === theUKE || countries === theUK) {
              setUKUnit(true);
              setUSUnit(false);
              setMetricUnit(false);
              customCheckBox1.checked = true;
              customCheckBox2.checked = false;
              console.log('In the UK');
          } else {
              setMetricUnit(true);
              setUKUnit(false);
              setUSUnit(false);
              customCheckBox1.checked = true;
              customCheckBox2.checked = false;
              console.log('The rest of the world...');
              return 'metric';
          }
      } catch (error) {
          console.error(error.message);
      }
  }

  const defaultTempUnit = (tempunit) => {
      if (metricUnit) {
          const celsius = Math.round( 5 / 9 * ( tempunit - 32));
          return celsius;
      } else if (usUnit) {
          return Math.round(tempunit);
      } else if (ukUnit) {
          const celsius = Math.round( 5 / 9 * ( tempunit - 32));
          return celsius;
      }
  }

  const tempSymbol = () => {
      if (usUnit) return '°F';
      return '°C'; // Defaults to Celsius for both metricUnit and ukUnit
  };      
  const symb = '';

  useEffect(() => {
      if (dayPage === false) {
          setDayIndex(0);
      } 
   }, [dayPage])

  const updateDayIndex = (index) => {
      setDayIndex(index);
   }


  if (loading) {
      return (
          <div className="bg-slate-50 place-items-center relative grid w-full h-screen">
              <span className="absolute top-1/3 spinner"></span>
              <div className="plead-message absolute top-[55%]"> Please hold on this may take a while...</div>
          </div>
      )
  }

  if (prompt) {
      return (
          <div className='weather-app h-screen bg-slate-50' id='target'>
              <LocationForm fetchData={fetchData} 
              convertCoordinates={convertCoordinates}/>
          </div>
      );
  }

  if (error) {
      return (
          <div className='weather-app h-screen'>
              <div className="error-message border border-zinc-400 bg-amber-100 relative grid place-self-center rounded place-content-center top-1/3 w-11/12">
                  <img src='/mark.png' className='place-self-start p-2'/>
                  <p className=' text-red-700 w-3/4 top-1/3 p-2'>Error: {error} please enter a valid address...</p>
              </div>
          </div>
      );
  }
               
   const hourMinFormat = (fullTime) => {
       const formattedTime = fullTime.slice(0, -3);
       return formattedTime;
   }

   const dateFormats = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
  };

  const formatFullDay = (numDay) => {
      const day = new Date(numDay);
      const realDate = new Intl.DateTimeFormat('en-US', dateFormats).format(day);
      return realDate;
  };

const precipType = (type, amount, snowamount, snowdepth ) => {
  const rainmessage = `${amount}, mm  of rainfall` 
  const snowmessage = `${snowamount}, cm  of snow with ${snowdepth} cm Depth`;

  if (type === null) {
      return 'No Current Precipitation'; 
  } else if (type.includes('rain' && 'snow')
  ) {
      return (rainmessage, snowmessage);
  } else if (type.includes('rain')) {
      return (rainmessage);
  } else if (type.includes('rain')) {
      return (snowmessage);
  }
}

const getHumidityColor = (humidity) => {
  if (humidity >= 0 && humidity < 30) return '#bef264'/*lime-300*/;
  if (humidity >= 30 && humidity < 60) return '#7dd3fc' /*sky-300*/;
  if (humidity >= 60 && humidity <= 100) return '#fdba74'/*orange-300*/;
  return 'gray'; // Default color
};

const getHumidityBGColor = (humidity) => {
if (humidity >= 0 && humidity < 30) return '#65a30d'/*lime-600*/;
if (humidity >= 30 && humidity < 60) return '#0284c7' /*sky-600*/ ;
if (humidity >= 60 && humidity <= 100) return '#ea580c'/*orange-600*/;
return 'gray-600'; // Default dark color
}; 

const getHumidityTxtColor = (humidity) => {
if (humidity >= 0 && humidity < 30) return '#65a30d'/*lime-600*/;
if (humidity >= 30 && humidity < 60) return '#7dd3fc' /*sky-600*/ ;
if (humidity >= 60 && humidity <= 100) return '#fdba74'/*orange-600*/;
return 'gray-600'; // Default dark color
}; 

const bearingConversion = (wcb) => {
  if (wcb >= 0 && wcb < 90) { 
      return `N${Math.round(wcb)}E`;
  } else if (wcb >= 90 && wcb < 180) {
      return `N${Math.round(180 - wcb)}E`;
  } else if (wcb >= 180 && wcb < 270) {
      return `S${Math.round(wcb - 180)}W`;
  } else if (wcb >= 270 && wcb < 360) {
      return `S${Math.round(360 - wcb)}E`
  }
}

const toKiloM = (mph) => {
  const kmh = Math.round(mph * 1.60934);
  return kmh;
}

const baroPercent = (pressure) => {
const perCent = ( pressure * 100 ) / ( 1013.25 * 1.2 ); // 1.2 added for scalling
return perCent;
}

const UVLevel = (uvval) => {
const uvPercent = ( uvval * 100 ) / 12;
return uvPercent;
}

const bttmAlign = (uvPercent) => {
if (uvPercent >= 0 && uvPercent < 50) { return `32`};
if (uvPercent >= 50 && uvPercent < 75) { return `16`};
if (uvPercent >= 75 && uvPercent < 100) { return `8`};
}

const getPhaseType = (phase) => {
  if (phase == 0) { return `new-moon-phase`};
  if (phase > 0 && phase < 0.25) { return `waxing-crescent-phase`};
  if (phase == 0.25) { return `first-quarter-phase`};
  if (phase > 0.25 && phase < 0.5) { return `waxing-gibbous-phase`};
  if (phase == 0.5) { return `full-moon-phase`};
  if (phase > 0.5 && phase < 0.75) { return `waning-gibbous-phase`};
  if (phase == 0.75) { return `last-quarter-phase`};
  if (phase > 0.75 && phase < 1) { return `waning-crescent-phase`};
}

const getPhaseInfo = (phase) => {
  if (phase == 0) { return `New Moon`};
  if (phase > 0 && phase < 0.25) { return `Waxing Crescent`};
  if (phase == 0.25) { return `First Quarter`};
  if (phase > 0.25 && phase < 0.5) { return `Waxing Gibbous`};
  if (phase == 0.5) { return `Full Moon`};
  if (phase > 0.5 && phase < 0.75) { return `Waning Gibbous`};
  if (phase == 0.75) { return `Last Quarter`};
  if (phase > 0.75 && phase < 1) { return `Waning crescent`};
}
 
  const showSetting = () => {
      const settingElement = document.querySelector('#w-menu-card');
      if (!settingElement) return;
      if (userUnitPreference) {
          checkCountry(userUnitPreference);
          console.log('using user pref');
      } else {
          checkCountry();
          console.log('using location');
      }
  
      if (settingElement.classList.contains('hide-card')) {
          settingElement.classList.remove('hide-card');
      } else {
          settingElement.classList.add('hide-card');
      }
  };
  
  const hideSettings = () => {
      const settingElement = document.querySelector('#w-menu-card');

      if (settingElement.classList) {
          settingElement.classList.add('hide-card');
      }
  }
 
  const showCurrentHour = () => {
      if (hourInfoRef.current.length > 0) {
          hourInfoRef.current[indexHour].scrollIntoView({
              behavior: 'instant',
              block: 'nearest',
              inline: 'start',
          });
          
          if (hourTimeRef.current[indexHour]) {
              hourTimeRef.current[indexHour].textContent = 'Now';
              hourTimeRef.current[indexHour].style.color = '#0d9488';
              if (dayPage === false) {
              dayRef.current[dayIndex].textContent = 'Today';
              dayRef.current[dayIndex].style.color = '#0d9488';
              }
          }
      } else {
          console.log('elemnt doesnt exist yet')
      }
  }

  const defaultPage = (page) => {
      setDayPage(page);
      checkCountry(userUnitPreference);
  }
   
  if (dayPage) {
      return (
          <div className='weather-app place-items-center relative grid w-full' id='target'>
             <div className="daily-page"> 
              <Days 
                  data={data} checkCountry={checkCountry} 
                   Overview={Overview} indexHour={indexHour}
                   HourlyList={HourlyList} CurrentConditions={CurrentConditions}
                   defaultTempUnit={defaultTempUnit} 
                   dayIndex={dayIndex} tempSymbol={tempSymbol}
                   onPageUpdate={defaultPage}
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
                   getPhaseInfo={getPhaseInfo}
                   hourMinFormat={hourMinFormat}
                   formatFullDay={formatFullDay}
                   showCurrentHour={showCurrentHour}
              /></div>
          </div>
      )
  }

  return (
    <motion.div initial="start"
    animate="end"
    transition={{ duration: 5, yoyo: Infinity }} // Infinite gradient animation
    style={{ minHeight: '100vh' }}

    className='h-auto w-[100%] relative' 
    id='target'>
        {data && (
            <>
            <div id="weather-app" className='grid justify-items-center grid-rows-auto grid-col-2 gap-5 relative bg-[#F9F9FB] z-20' 
                onLoad={defaultTempUnit}
                onClick={hideSettings}
             >
                <div className="search z-50 relative top-3 p-1 grid grid-auto w-full">
                    <motion.input type="search"
                     value={query} 
                     className='search-icon search-bar justify-self-center w-11/12 text-md row-span-auto bg-[#E2E850] p-3 rounded-full focus:rounded-full focus:scale-[1.025] focus:bg-[#F5F5F5] focus-within:outline-none border border-[#CBD5E1] text-[#0F172A]  z-[50]' 
                     name="place" id="place"
                     onChange={InputValChange}
                     onFocus={joinSuggestions()}
                     style={{
                        
                        borderBottomLeftRadius: suggestions.length >= 1 ? 'none' : '',
                        borderBottomRightRadius: suggestions.length >= 1 ? 'none' : '',
                     }}
                     placeholder={address} />

                {suggestions.length > 0 && (
                    <ul className=' absolute justify-self-center w-11/12 top-12 text-zinc-800 bg-[#f5f5f5] border-2 scale-[1.005] border-gray-200 rounded-b-2xl overflow-y-clip z-[50]'>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className={`p-1 text-neutral-950 text-sm  hover:opacity-70 `} onClick={
                                 () => {
                                    setQuery(suggestion);
                                    setSuggestions([]);
                                    setChosenIndex(index);
                                    unformatLocation(index);
                                    }
                                }> <span className="search-image relative text-left "> <img src={`icons8-search-location-48.png`} alt="" srcSet="" className='size-5 inline ms-2' /> </span>
                                 <span className="suggestions relative w-[85%] left-1 text-justify">{suggestion}</span> </li>
                        ))}
                    </ul>
                )}
                </div>

                <Overview 
                  data={data} dayIndex={dayIndex} 
                  indexHour={indexHour} defaultTempUnit={defaultTempUnit}
                  tempSymbol={tempSymbol} iconBasePath={iconBasePath} />

                <HourlyList 
                  data={data} dayIndex={dayIndex} indexHour={indexHour}
                  defaultTempUnit={defaultTempUnit} hourTimeRef={hourInfoRef}
                  hourInfoRef={hourInfoRef}
                  tempSymbol={tempSymbol} iconBasePath={iconBasePath} 
                  hourMinFormat={hourMinFormat}/>

                <div className="daily-forecast forecast grid grid-rows-1 w-11/12 bg-[#EBEBEB] p-3 mt-1 mb mx-3 shadow-md rounded-lg">
                    <div className="desc text-md font-normal text-[#505058] py-1"> Daily Forecast </div>

                    <ul className=" max-h-auto overflow-y-scroll">
                        {data.days.slice(0, 10).map((day, index) => (
                            <motion.li key={index} 
                                className="grid grid-flow-col bg-[#F9F9FB] px-3 py-3 rounded-md active:scale-95" 
                                style={{
                                    marginBlockEnd: '.5em',
                                }}
                                onClick={() => {
                                    setDayPage(true);
                                    updateDayIndex(index);
                                }}>
                                <p className='inline-block text-[#505058] text-sm h-fit' ref={(el) => (dayRef.current[index]) = el }>{formatFullDay(day.datetime)}</p>
                                <span className="dayInfo justify-self-end ">
                                <p className='inline-block text-[#008080] text-sm px-2'>{defaultTempUnit(day.temp)}{tempSymbol(symb)}</p>
                                <p className='inline-block text-zinc-700 text-sm px-2'>{Math.round(day.precipprob)}%</p>
                                <p className="inline-block"> <img src={`${iconBasePath}${day.icon}.png`} alt="" className="src size-5" /> </p>
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
                
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
                  getPhaseInfo={getPhaseInfo}
                  />
        </div>

            <span className="menu-butn absolute top-[13%] right-[2.5%] translate-y-full text-sm z-50" onClick={showSetting}
            >
                    <img src="/icons8-menu-vertical-24.png" 
                    className='active:opacity-70 bg-transparent p-1 rounded-full size-fit'
                    alt="" srcSet="" />
                </span>

            <div id='w-menu-card' 
                className="w-menu-card hide-card absolute top-[10%] right-[5%] translate-y-full border-2 border-gray-200 bg-[#ebebeb] w-fit h-fit px-2 py-3 rounded z-[50]"
                onLoad={hideSettings}
                >
                <div className="pref-units">
                    <h1 className="desc desc text-base font-normal text-[#333333] pb-2"> Temperature Units</h1>
                    <label className="custom-checkbox" htmlFor="">
                        <p 
                            className="units check-button1"
                            onClick={checkActionCels}
                            >
                            <input type="radio" className='custom-checkbox1 pe-4 text-base font-medium text-[#333333]' name="celsius" value={'metric'}  /><span></span>Celsius</p>
                        <p 
                            className="units check-button2"
                            onClick={checkActionFahr}
                            >
                            <input type="radio" className='custom-checkbox2 pe-4 text-base font-medium text-[#333333]' name="fahrenhait" value={'us'} /> <span></span>Fahrenhait</p>
                    </label>
                </div>
                <button className="px-1 text-sm relative top-1 w-fit shadow-none active:opacity-70 text-red-600" onClick={resetData}> Reset</button>
            </div>
            </>
        )}
    </motion.div>
  )
}

export default WeatherApp
