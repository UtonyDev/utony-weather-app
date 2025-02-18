import { useState, useEffect, useRef, useCallback} from 'react';
import { motion } from "framer-motion";
import axios from "axios";
import { debounce } from 'lodash';
import CurrentConditions from './Components/CurrentConditions';
import HourlyList from './Components/HourlyList';
import Overview from './Components/Overview';
import Days from './Components/Days';
import LocationForm from './Components/LocationForm';
import RecentSearches from './Components/Recents';
import { sin, cos, evaluate, index } from 'mathjs';
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
  const [dayPage, setDayPage] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [metricUnit, setMetricUnit] = useState(false);
  const [usUnit, setUSUnit] = useState(false);
  const [ukUnit, setUKUnit] = useState(false);
  const [recentSearch, setRecentSearch] = useState(false);
  const [settingsZ, setSettingZ] = useState(false);
  const [passedCountry, setPassedCountry] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tabWidth, setTabWidth] = useState(0);
  const listContainer = useRef(null);
  const hourInfoRefs = useRef([]); 
  const hourTimeRef = useRef(null);
  const recentsRef = useRef(null);
  const dayRef = useRef([]);
  const tabRef = useRef(null);
  const API_KEY = '124d73669936416ea36f14503e262e7d';
  let userUnitPreference = localStorage.getItem('userUnitPref');
  const iconBasePath = '/GWeatherIcons/';

  const InputValChange = useCallback(async (e) => {
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
  });

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

  const unformatLocation = useCallback((index) => {
      const chosenList = holdResult[index];
      console.log(chosenList);

     const splitData = chosenList.split(',');
     console.log(splitData)
      if (splitData) {
          const newcity = splitData[dayIndex];
          const newcountry = splitData[splitData.length - 1].trim();
          console.log(newcountry)
          setPassedCountry(newcountry);
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
  })

  const resetData = () => {
      localStorage.removeItem('weatherCache');
      localStorage.removeItem('userUnitPref');
      window.location.reload();
  }

  useEffect(() => {
      // Retrieve the weather cache object from localStorage
      const weatherCacheKey = 'weatherCache';
      const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
      const savedCacheKey = 'savedKey';
      let userPreferedCountry = JSON.parse(localStorage.getItem(savedCacheKey)) || [];
      let userPreferedKey = String(userPreferedCountry).replace(/"/g, "").replace(/,([^,]*)$/, ",$1");
      console.log("the user prefers:", userPreferedKey);
      console.log("the user prefers the country:", userPreferedKey);
  
      console.log('Cached data:', cachedData);
  
      // Check if there is any data in the cache
      if (Object.keys(cachedData).length > 0) {
        const latestKey = Object.keys(cachedData).at(-1);
        let latestData = cachedData[latestKey];
        console.log(latestData);
       
        if (userPreferedKey.length > 0) {
            let userPreferedData = cachedData[userPreferedKey]
            console.log("the user prefers the data:", userPreferedData);
            console.log(cachedData["London:United Kingdom"]);
            setData(userPreferedData);
        } else {
            setData(latestData); 
            console.log('Using cached data from weatherCache:', latestData);
          console.log(latestData.resolvedAddress);
          
        }

        if (userUnitPreference) {
            checkCountry(userUnitPreference);
            console.log('the user prefers: ', userUnitPreference);
        } else {
            console.log('user hasnt set preference');
            if (latestData) {
              let cacheLocation = latestData.resolvedAddress.split(',');
              const cacheCountry = cacheLocation[cacheLocation.length -1].trim();
              console.log("the cached country is", cacheCountry);
              checkCountry(cacheCountry); 
            } 
        }
  
      } else {
          // No cached data, show the location prompt.
          setPrompt(true);
      }
  }, []);

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

              const currentTime = new Intl.DateTimeFormat("en-US", {
                  timeZone: timezone,
                  hour: "2-digit",
                  hour12: false // Use 24-hour format, set to true for 12-hour format
              }).format(new Date());

              function parseCurrentTime(time) {
                  if (time.charAt(0) == 0) {
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
  const fetchData = useCallback(async (city, country) => {
    console.log(country);

    // Store country in localStorage
    localStorage.setItem('storedCountry', JSON.stringify(country));
    let cacheKey = `${city}:${country}`;
    const weatherCacheKey = 'weatherCache';

    setLoading(true);
    setPrompt(true);

    try {
        // Check cache
        const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
        if (cachedData[cacheKey]) {
            const jsonCachedData = cachedData[cacheKey];
            setData(jsonCachedData); // Use cached data
            console.log('Using cached weather data:', jsonCachedData);
        } else {
            // Fetch data from server
            const response = await fetch(`https://utony-weather-server.onrender.com/api/weather?city=${city}&country=${country}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonData = await response.json();

            // Store fetched data
            localStorage.setItem('storedData', JSON.stringify(jsonData));
            console.log('New stored data', jsonData);

            // Update cache
            cachedData[cacheKey] = jsonData;
            localStorage.setItem(weatherCacheKey, JSON.stringify(cachedData));

            setData(jsonData); // Set fetched data to state
            console.log('Fetched data from server:', jsonData);
        }
    } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.message); // Handle network error
    } finally {
        setPrompt(false); // End prompt state
        setLoading(false); // End loading state
    }
});

  const convertCoordinates = async (latitude, longitude) => {
      const apiKey = '124d73669936416ea36f14503e262e7d';

      const url = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}%2C+${longitude}&pretty=1&no_annotations=1`;

      fetch(url)
      .then(response => response.json())
      .then(data => {
          if (data.results.length > 0) {
          const city = `${data.results[dayIndex].components._normalized_city}, ${data.results[dayIndex].components.state},`;
          let country = `${data.results[dayIndex].components.country}`;
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
  
          const theUSA = 'United States of America';
          const theus = 'us';
          const theUS = 'United States';
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

  const estimatedPrecipChance = (prob) => {
    if (data) {
       const iteratedProbs = data.days[0].hours.map(hour => hour.precipprob);
       const averagedProb = (iteratedProbs.reduce((sum, prob) => sum + prob, 0) / 24 );
       return Math.round(averagedProb);
    }
  }

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
const perCent = ( pressure * 100 ) / ( 1013.25 * 1.125); // 1.2 added for scalling
return perCent;
}

const UVLevel = (uvval) => {
    return (( uvval * 76 ) / 12);
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

    const sunPosition = (sunriseTime, sunsetTime) => {
        const sunRise = sunriseTime.split(':');
        const sunSet = sunsetTime.split(':');
        console.log('sunrise hour and minute', sunRise[0], sunRise[1]);
        // Convert from hour format to integer format
        const T1 = parseFloat(sunRise[0]) + (parseFloat(sunRise[1]) / 60);
        const T2 = parseFloat(sunSet[0]) + (parseFloat(sunSet[1]) / 60);
    
        console.log(T1,T2);
    
        if (parseFloat(indexHour) >= T1 && parseFloat(indexHour) <= T2) {
            const angleInterval = [180, 0];
            console.log(angleInterval[0]);
            // Use linear interpolation to get value of angles at various time intervals (current time)
        
            const angle = angleInterval[0] + (((parseFloat(indexHour) - T1) * (angleInterval[0] - angleInterval[1])) / (T2 - T1));
            console.log('angley', angle);
        
            const x = 20 + 30 * Math.cos(angle * (Math.PI / 180));
            const y = 20 + 30 * Math.sin(angle * (Math.PI / 180));
        
            console.log('x, y', x, y);

            setPosition({ x, y });
        } else if (indexHour < T1 ) {
            console.log('early morning');
            const t1 = 1;
            const t2 = parseFloat(sunRise[0]) + (parseFloat(sunRise[1]) / 60);
            console.log(t2)
            // For left ellipse 
            const angleInterval = [90, 0];
            // Use linear interpolation to get value of angles at various time intervals (current time)
            const angle = angleInterval[0] + (((parseInt(indexHour) - t1) * (angleInterval[1] - angleInterval[0])) / (t2 - t1));
            console.log('angle', angle);
        
            const x = (30 * Math.cos(angle * (Math.PI / 180))) - 40;
            const y = (15 * Math.sin(angle * (Math.PI / 180))) + 20;
        
            console.log('x, y', x, y);

            setPosition({ x, y });
    
        } else if (indexHour > T2) {
            console.log('late night');
            const tr1 = 24;
            const tr2 = parseFloat(sunSet[0]) + (parseFloat(sunSet[1]) / 60);
            console.log(tr1)
            // For right ellipse 
            const angleInterval = [90, 180];
            // Use linear interpolation to get value of angles at various time intervals (current time)
            const angle = angleInterval[0] + (((parseInt(indexHour) - tr1) * (angleInterval[1] - angleInterval[0])) / (tr2 - tr1));
            console.log('angle', angle);
        
            const x = (30 * Math.cos(angle * (Math.PI / 180))) + 80;
            const y = (15 * Math.sin(angle * (Math.PI / 180))) + 20;
        
            console.log('x, y', x, y);

            setPosition({ x, y });
        }
    } 

    useEffect(() => {
    if (data) {
    sunPosition(data.days[dayIndex].sunrise, data.days[dayIndex].sunset)
    }
    }, [indexHour, recentSearch]);
 
const showSetting = () => {
    const settingElement = document.querySelector('#w-menu-card');
    console.log(passedCountry);
    if (userUnitPreference) {
        checkCountry(userUnitPreference);
        console.log('using user pref');
    } else if (passedCountry) { 
        checkCountry(passedCountry);
        console.log('using location');
    } else {
        console.log("No country data available");
    }

    // Toggle the setting menu visibility
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
      if (listContainer.current) {
        console.log('container exists');
        const listItem = hourInfoRefs.current[indexHour];
        const listcontainer = listContainer.current;
        listcontainer.scrollTo({
            left: listItem.offsetLeft - listcontainer.offsetLeft,
            behavior: "smooth", // Enables smooth scrolling
        });
        
        if (hourTimeRef.current[indexHour]) {
            if (dayPage === false) {
            dayRef.current[dayIndex].textContent = 'Today';
            dayRef.current[dayIndex].style.color = '#0d9488';
            }
        }
      } else {
          console.log('elemnt doesnt exist yet')
      }
  }

  const highlightCurrentDay = () => {
    const dayElement = document.querySelectorAll('.day-element');
    if (dayElement[0]) {
        dayElement[0].classList.add('bg-teal-100');
        dayElement[0].classList.add('rounded-md');
        dayElement[0].textContent = 'Today';
        dayElement[0].classList.add('text-teal-600');
    }
}
useEffect(() => {highlightCurrentDay()})

const showRecentSearch = () => {
    if (window.innerWidth < 768) {
        recentsRef.current.style.left = 0;
    }
}

const hideRecentSearch = () => {
    if (window.innerWidth < 768) {
        recentsRef.current.style.left = '100%';
    } else {
        recentsRef.current.style.left = '0';
    }
}

const getTabWidth = () => {
    if (tabRef.current) {
    const width = tabRef.current.clientWidth;
    setTabWidth(width - 55);
    }
}; 

  const defaultPage = (page) => {
      setDayPage(page);
      checkCountry(userUnitPreference);
  }

useEffect(() => {
    if (data) {
        const weathercondition = data.days[dayIndex].hours[indexHour].conditions;
        const body = document.getElementById("body");
        console.log(weathercondition);
        const clear = "Clear";
        const cloudy = ["Partially cloudy", "Overcast"];
        const rainy = "Rain, Partially cloudy";

        if (weathercondition.includes(clear)) {
            console.log('clear skyies');            
            body.classList.add(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/cloudy-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/rain-backdrop.jpeg')]`);
        } else if (weathercondition === 'Overcast') {
            console.log('no clear');
            body.classList.add(`bg-[url('/cloudy-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/rain-backdrop.jpeg')]`);
        } else if (weathercondition.includes(rainy)) {
            console.log('Raining');
            body.classList.add(`bg-[url('/rain-backdrop.jpeg')]`);
            body.classList.remove(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/cloudy-backdrop.jpg')]`);
        }
    }
  }, [data, indexHour, dayIndex])

  return (
    <motion.div initial="start"
    animate="end"
    transition={{ duration: 5, yoyo: Infinity }} // Infinite gradient animation
    style={{ minHeight: '100vh' }}

    className='h-auto w-[100%] relative bg-contain md:bg-cover' 
    id='body'>
        
        {loading ? (
            <div className="bg-[#f1f1f1] place-items-center relative grid w-full h-screen">
                <span className="absolute top-1/3 spinner"></span>
                <div className="plead-message absolute top-[55%]">
                    Please hold on, this may take a while...
                </div>
            </div>
        ) : error ? (
            <div className="weather-app h-screen">
                <div className="error-message border border-zinc-400 bg-amber-100 relative grid place-self-center rounded place-content-center top-1/3 w-11/12">
                    <img src="/mark.png" className="place-self-start p-2" />
                    <p className="text-red-700 w-3/4 top-1/3 p-2">
                        Error: {error} Please enter a valid address...
                    </p>
                </div>
            </div>
        ) : prompt ? (
            <div className="weather-app h-screen bg-slate-50" id="target">
                <LocationForm fetchData={fetchData} convertCoordinates={convertCoordinates} />
            </div>
        ) : dayPage ? (
            <Days 
            data={data} checkCountry={checkCountry} 
             Overview={Overview} indexHour={indexHour}
             RecentSearches={RecentSearches} address={address}
             recentSearch={recentSearch} showSetting={showSetting}
             settingsZ={settingsZ} sunPosition={sunPosition} 
             position={position} getTabWidth={getTabWidth} 
             tabWidth={tabWidth}
             setIndexHour={setIndexHour} setRecentSearch={setRecentSearch}
             setSettingZ={setSettingZ} setData={setData}
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
             getPhaseType={getPhaseType}
             getPhaseInfo={getPhaseInfo}
             hourMinFormat={hourMinFormat}
             formatFullDay={formatFullDay}
             showCurrentHour={showCurrentHour}/>
        ) : data && (
        <>
            <div id="weather-app" className={`weather-app-grid grid md: justify-items-center col-auto gap-5 md:gap-0 relative md:h-full z-20 overflow-clip`} 
                onLoad={defaultTempUnit}
                onClick={hideSettings}
             >

                <div className="search z-50 relative top-2 md:top-0 md:m-0 p-1 grid grid-auto w-full max-h-[48px]">
                    <motion.input type="search"
                     value={query} 
                     className='search-icon search-bar justify-self-center w-11/12 text-md row-span-auto p-3 md:mt-1 rounded-full focus:rounded-full focus:scale-[1.025] focus:bg-[#F5F5F5] focus-within:outline-none border border-neutral-300 focus:border-neutral-400 text-neutral-700 text-base
                     tracking-[0.0125] font-normal z-[50]' 
                     name="place" id="place"
                     onLoad={() => checkCountry(passedCountry)}
                     onChange={InputValChange}
                     onFocus={joinSuggestions()}
                     style={{
                        
                        borderBottomLeftRadius: suggestions.length >= 1 ? 'none' : '',
                        borderBottomRightRadius: suggestions.length >= 1 ? 'none' : '',
                     }}
                     placeholder={address} />

                {suggestions.length > 0 && (
                    <ul className=' absolute justify-self-center w-11/12 top-[2.9em] md:top-[3.15rem] text-zinc-800 bg-neutral-100 border-1 border-neutral-400 rounded-b-2xl overflow-y-clip z-[50]'>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className={`p-1 flex text-neutral-950 text-[17px] font-normal hover:opacity-70 `} onClick={
                                 () => {
                                    setQuery(suggestion);
                                    setSuggestions([]);
                                    unformatLocation(index);
                                    console.log(passedCountry)
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

                <div className="summary"></div>

                <HourlyList 
                  data={data} dayIndex={dayIndex} indexHour={indexHour} ref={{ listContainer, hourTimeRef }}
                  hourInfoRef={hourInfoRefs}
                  setIndexHour={setIndexHour} showRecentSearch={showRecentSearch}
                  hideRecentSearch={hideRecentSearch} hideSettings={hideSettings}
                  settingsZ={settingsZ} setSettingZ={setSettingZ}
                  defaultTempUnit={defaultTempUnit} 
                  showCurrentHour={showCurrentHour}
                  tempSymbol={tempSymbol} iconBasePath={iconBasePath} 
                  hourMinFormat={hourMinFormat}/>

                <div className="daily forecast w-11/12 md:w-full md:max-h-[710px] bg-[#e5e5e580] p-3 mt-1 md:mt-0 mx-3 md:mx-0 md:mb-0 rounded-lg md:rounded-none ">

                    <div className="desc text-[17px] h-fit font-medium text-[#404C4F] py-2"> Daily Forecast  
                    </div>

                    <ul className=" max-h-auto">
                        {data?.days?.slice(0, 10).map((day, index) => (
                            <motion.li key={index} 
                                className="flex flex-row justify-between bg-[#F9F9FB] px-3 py-3 rounded-md active:scale-95" 
                                style={{
                                    marginBlockEnd: '.5em',
                                }}
                                onClick={() => {
                                    setDayPage(true);
                                    updateDayIndex(index);
                                }}>

                                <p className='day-element inline-block text-[#404C4F] font-normal tracking-wide text-base p-1 w-fit h-fit ' ref={(el) => (dayRef.current[index]) = el }>{formatFullDay(data.days[index].datetime)}</p>

                                <span className="dayInfo flex">
                                <p className='inline-block text-teal-900 font-base tracking-wide text-base px-2 align-baseline'>{defaultTempUnit(day.temp)}{tempSymbol(symb)}</p>
                                <p className='inline-block text-[#505058] font-sans font-normal tracking-wide text-base px-2'>{index === 0 ? estimatedPrecipChance(day.precipprob) : Math.round(day.precipprob)}%</p>
                                <p className="inline-block"> <img src={`${iconBasePath}${day.icon}.png`} alt="" className="src size-5" /> </p>
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <div className="recents">
                    <RecentSearches 
                     data={data} setData={setData} 
                     indexHour={indexHour} address={address} 
                     ref={{ tabRef, recentsRef }}
                     recentSearch={recentSearch} showSetting={showSetting}
                     hideRecentSearch={hideRecentSearch}
                     showRecentSearch={showRecentSearch}
                     setIndexHour={setIndexHour} checkCountry={checkCountry}
                     dayIndex={dayIndex} settingsZ={settingsZ}
                     tabWidth={tabWidth} setTabWidth={setTabWidth}
                     getTabWidth={getTabWidth}
                     setSettingZ={setSettingZ} 
                     defaultTempUnit={defaultTempUnit} 
                     tempSymbol={tempSymbol}
                    />
                </div>
                
                <CurrentConditions 
                  data={data} dayIndex={dayIndex} indexHour={indexHour}
                  formatFullDay={formatFullDay} defaultTempUnit={defaultTempUnit}
                  showCurrentHour={showCurrentHour} hourMinFormat={hourMinFormat} 
                  precipType={precipType}
                  position={position}
                  getHumidityBGColor={getHumidityBGColor}
                  getHumidityColor={getHumidityColor}
                  getHumidityTxtColor={getHumidityTxtColor}
                  bearingConversion={bearingConversion}
                  toKiloM={toKiloM}
                  baroPercent={baroPercent}
                  UVLevel={UVLevel}
                  getPhaseType={getPhaseType}
                  getPhaseInfo={getPhaseInfo}
                  />
        </div>

            <span className={`butn absolute top-[12%] md:top-[20%] right-[2.5%] md:right-[1.25%]  translate-y-full text-sm ${settingsZ ? 'z-[0]' : 'z-[60]'} `} onClick={showSetting}>
                    <img src="/icons8-menu-vertical-24.png" 
                    className='active:opacity-70 bg-transparent p-1 rounded-full  size-8'
                    alt="" srcSet="" />
            </span>

            <div id='w-menu-card' 
                className="w-menu-card hide-card absolute top-[9.5%] md:top-[15%] right-[5%] md:right-[2.5%]
                 translate-y-full border-2 border-gray-200 bg-[#ebebeb] w-fit h-fit px-2 py-3 rounded z-[50]"
                onLoad={hideSettings}
                >
                <div className="pref-units">
                    <h1 className="desc desc text-base font-normal text-[#333333] pb-2"> Temperature Units</h1>
                    <label className="custom-checkbox" htmlFor="">
                        <p 
                            className="units check-button1"
                            onClick={() => checkActionCels()}
                            >
                            <input type="radio" className='custom-checkbox1 pe-4 me-1 text-base font-medium text-[#333333]' name="celsius" value={'metric'}  /><span></span>Celsius</p>
                        <p 
                            className="units check-button2"
                            onClick={() => checkActionFahr()}
                            >
                            <input type="radio" className='custom-checkbox2 pe-4 me-1 text-base font-medium text-[#333333]' name="fahrenhait" value={'us'} /> Fahrenhait</p>
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
