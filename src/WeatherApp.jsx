import { useState, useEffect, useRef, useCallback} from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import { debounce } from 'lodash';
import CurrentConditions from './Components/CurrentConditions';
import HourlyList from './Components/HourlyList';
import Overview from './Components/Overview';
import AIOverview from './Components/AIOverview.jsx';
import Days from './Components/Days';
import LocationForm from './Components/LocationForm';
import Loading from './Components/Loading';
import RecentSearches from './Components/Recents';
import UVLevel from './Utilities/UvLevel.js';
import { getHumidityColor, getHumidityBGColor, getHumidityTxtColor } from './Utilities/Humidity.js';
import { precipType } from './Utilities/Precipitation.js';
import { getPhaseType, getPhaseInfo } from './Utilities/Astro.js';
import { bearingConversion, toKiloM } from './Utilities/Wind.js';
import { baroPercent } from './Utilities/Baro.js';
import './Components/weather.css';
import './App.css';
import './index.css';
import 'intersection-observer';
import { dialog } from 'framer-motion/client';

function WeatherApp() {
// State for user location prompting.
  const [prompt, setPrompt] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [indexHour, setIndexHour] = useState(0);
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('address') || ''; 
  }); 
    const [query, setQuery] = useState("");
  const prevAddress = useRef(true);
  const [currentKey, setCurrentKey] = useState(() => {
    return localStorage.getItem('currentAddress') || '';
  }
  );
  const [suggestions, setSuggestions] = useState([]);
  const [holdResult, setHoldResult] = useState('');
  const [errMessage, setErrMessage] = useState('');
  const [dayPage, setDayPage] = useState(false);
  // State for specified day data.
  const [dayIndex, setDayIndex] = useState(0);
  const [displayAddress, setDisplayAddress] = useState('');
  const [metricUnit, setMetricUnit] = useState(false);
  const [usUnit, setUSUnit] = useState(false);
  const [ukUnit, setUKUnit] = useState(false);
  const [recentSearch, setRecentSearch] = useState(false);
  const [settingsZ, setSettingZ] = useState(false);
  const [passedCountry, setPassedCountry] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tabWidth, setTabWidth] = useState(0);
  const listContainer = useRef(null);
  const hourInfoRefs = useRef([]); 
  const hourTimeRef = useRef(null);
  const recentsRef = useRef(null);
  const dayRef = useRef([]);
  const tabRef = useRef(null);

  const API_KEY = import.meta.env.VITE_API_KEY;
  const iconBasePath = '/GWeatherIcons/';
  // Universal cache key.
  let weatherCacheKey = 'weatherCache';

  let userUnitPreference = localStorage.getItem('userUnitPref');
  let userPreferedLocation = localStorage.getItem("savedKey") || [];
  let userPreferedKey = String(userPreferedLocation).replace(/"/g, "").trim(); 

  console.log("the start up address is", address);

const getFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
};

const saveToLocalStorage = (city, country, storedData) => {
    // Get the weatherCache object if it exist else initialize an empty one.
    const cachedData = JSON.parse(localStorage.getItem(weatherCacheKey)) || {};
    const cacheKey = `${city}:${country}`;
    // Use the cacheKey to construct new entry data with timestamp.
    cachedData[cacheKey] = {
        storedData,
        timestamp: Date.now(),
    };
    // Add the data to the weatherCache object stored in localStorage.
    localStorage.setItem(weatherCacheKey, JSON.stringify(cachedData));
};

// Function to fetch weather data.
const fetchData = async (city, country) => {
    // When fetch function called it checks localStorage for existing data.
    const cachedJsonData = getFromLocalStorage();
    // Combine city & country again to form new address key.
    const cacheKey = `${city}:${country}`;    

    const fetchNewData = async (city, country) => {
        try {
            // Timeout to display message after long request time.
            const timeLimit = setTimeout(() => {
                setDialogMessage("Taking longer than usual... please wait or check your network connection.");
            }, 5000)
            console.log("Timeout for fetching new data returned: ", timeLimit);
            const response = await axios.get(`https://utony-weather-server.onrender.com/api/weather?city=${city}&country=${country}`);
            // Retrieve data from response.
            const jsonData = response.data;
            // Save the newly fetched data to localStorage with the city & country as key and the jsonData as the value.
            saveToLocalStorage(city, country, jsonData);
            console.log("The NEW response is", jsonData);
            // Return the response of the request to the useQuery hook.
            return jsonData;

        } catch (error) {
          console.log(error.message);
          setErrMessage(error.message);
        }
    }

    // Check if the Object "cachedJsonData" cached in localstorage has atleast one key, if it does then there exist a cache.
    console.log('The cache exist ? ', Object.keys(cachedJsonData).length > 0);
    if (Object.keys(cachedJsonData).length > 0 && prevAddress.current ) {
        console.log("Using cached json data", cachedJsonData[cacheKey].storedData);
        const timeStamp = cachedJsonData[cacheKey].timestamp;
        console.log("the timestamp for", address, " is ", timeStamp)
        const staleTime = 1000 * 60 * 60 * 1; // 1hr interval stale time
        console.log(staleTime); 
        const now = new Date();
        now.setHours(indexHour, 0, 0, 0);
        const currentUNIXtime = now.getTime(); 
        const timeState = currentUNIXtime + (1000 * 3600);
        console.log('the current unx hour is', currentUNIXtime);
        console.log('the timeSTATE is', timeState);
        console.log(timeState > timeStamp);

        if (timeState > timeStamp) {
            // StaleTime set has been exceeded.
            console.log('staletime exceeded, time to refresh');
            console.log("Changed the currentKey", currentKey);
            if (userPreferedLocation.length > 0) {
                console.log('re-fetching the user favorite location');
                setLoading(false);
                setPrompt(false);
                const splitPreferedKey = userPreferedKey.split(':');
                return fetchNewData(splitPreferedKey[0].trim(), splitPreferedKey.at(-1).trim());
            } else {
                console.log('re-fetching the default location')
                setLoading(false);
                setPrompt(false);
                return fetchNewData(city, country);
            }
            
        } else {
            // Staletime has yet to be exceeded.
            if (userPreferedLocation.length > 0) {
                console.log('using the user favorite location already in cache.');
                setPrompt(false);
                console.log('the preferred key selected is ', userPreferedKey);
                return cachedJsonData[userPreferedKey].storedData;        
            } else {
                console.log('NAH!!!... continuing using the cache');
                setPrompt(false);
                return cachedJsonData[cacheKey].storedData;
            }            
        }            

    } else {
        // Fetch fresh data.
        console.log("Since no cache: Fetching NEW data...");
        setCurrentKey(cacheKey);
        return fetchNewData(city, country);
    }
};
// Called from the LocationForm component it converts coords to city & country then changes the address to trigger a request.
const convertCoordinates = async (latitude, longitude) => {
    const apiKey = '124d73669936416ea36f14503e262e7d';
    const url = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}%2C+${longitude}&pretty=1&no_annotations=1`;
    
    try {
        // Use coords (lat & long) to get further details such as address (i.e: city, country).
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        // Extract city and country from resonse.
        const city = `${data.results[0].components._normalized_city}, ${data.results[0].components.state},`;
        const country = `${data.results[0].components.country}`;
        // Combine city & country into single address key.
        const resolvedAddress = `${city}${country}`;
        console.log("The combined RESOLVED address is: ",resolvedAddress);
        // Store this address in localStorage.
        localStorage.setItem('resolvedAddress', resolvedAddress);
        // Set address state to the address key which would trigger a query.
        setAddress(resolvedAddress);
        // Store address to localStorage so the useQuery hook can use it to make request from what was initially stored.
        localStorage.setItem('address', resolvedAddress);
        // Pass country to verify unit to be used.
        checkCountry(country);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
};

// UseQuery hook use to make request
const { data, isLoading, isError, error } = useQuery({
    // Changes in query key would trigger hook to make request.
    queryKey: ['weatherData', address],
    queryFn: async () => {
        // No data found in querykey cache yet fetch new.
        console.log("No data found in querykey cache yet fetch NEW...");
        const splitAddress = address.split(',');
        const splitCity =  splitAddress.length > 2 ? splitAddress.slice(0, splitAddress.length -1) : splitAddress[0]?.trim();
        // Pass split address to make request.
        const result = await fetchData(splitCity, splitAddress.at(-1));
        // DECIPHER
        setCurrentKey(address);
        console.log('Fetch result:', result);
        // Check unit preferences.
        if (userUnitPreference) {
            checkCountry(userUnitPreference);
            console.log('using user pref');
        } else {
            checkCountry( splitAddress.at(-1)?.replace(/"/g, '').trim());
            console.log('using location');
        }
        // Return the result of specified query to the "data" destructured variable from the useQuery hook. Now data hold that result.
        return result;
    },      
    enabled: !!address, 
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 30,
  }
);
    
// Fetch suggestions based on the input being entered.
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
              if (results.length > 0) {
                console.log("the Raw search result from Opencage is: ", results)
                setHoldResult(results);
                console.log("the Formatted search result from Opencage is: ", holdResult);
                setSuggestions(results);
              } else {
                console.log("No search result found");
                setSuggestions(["No search result found"])
              }
              
          } catch (error) {
              console.error("Error fetching suggestions:", error);
              alert(error);
          }
          
      } else {
          setSuggestions([]);
      }
  },[holdResult, API_KEY]);

  // Searches for location selected by user.
    const searchLocation = useCallback((index) => {
      const chosenList = holdResult[index];
      console.log(chosenList);

        const splitData = chosenList.split(',');
        console.log(splitData)
      if (splitData) {
          const newcity = splitData[dayIndex];
          const newcountry = splitData[splitData.length - 1].trim();
          console.log(newcountry)
          setPassedCountry(newcountry);
          const searchedLocation = `${newcity},${newcountry}`;
          console.log("the user searched for ",searchedLocation);
          prevAddress.current =  false;
          // Change address state to the searched address to trigger a request.
          setAddress(searchedLocation);
          // Log the address to the LocalStorage to persist across refresh.
          localStorage.setItem("address", searchedLocation);

          if (userUnitPreference) {
              checkCountry(userUnitPreference);
              console.log('using user pref');
          } else {
              checkCountry(newcountry);
              console.log('using location');
          }
          console.log('search length is:', splitData.length);
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

  // Search the location the user entered without clicking one of the suggestions.
const handleSubmit = (e) => {
    e.preventDefault();
    // Possible selectors for search imput
    const sep = [' ', ','];
    // Map selectors and choose that which is found in input string
    const matchedIndx = sep.findIndex(char => query.includes(char));
    console.log(matchedIndx);
    // Block single word inputs.
    if (matchedIndx >= 0) {
        const splitQuery = query.split(sep[matchedIndx])
        console.log('the current value in the input is', splitQuery);
        // Remove comma incase included.
        const mappedQuery = splitQuery.map(que => {
            if (que.includes(',')) {
                return que.replace(',', '');
            } else {
                return que;
            }
        })
        console.log("the formatted query array: ", mappedQuery);
        const city = mappedQuery[0];
        const country = mappedQuery.at(-1);
        const enteredLocation = `${city},${country}`;

        console.log("the user searched for ", enteredLocation);
            prevAddress.current =  false;
            // Fetch data by changing address.
            setAddress(enteredLocation);
            // Remove the search suggestions 
                setSuggestions([])

        if (userUnitPreference) {
            checkCountry(userUnitPreference);
            console.log('using user pref');
        } else {
            checkCountry(country);
            console.log('using location');
        }
    } else {
        console.log("Please enter a valid city and country");
    }
    
  }
  
  const resetData = () => {
      localStorage.removeItem('weatherCache');
      localStorage.removeItem('userUnitPref');
      localStorage.removeItem('savedItem');
      window.location.reload();
  }

  useEffect(() => {
      if (data) {
          if (data.days && data.days[dayIndex]?.hours) {            
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
              if (coordinates) {
                  const resolvedAddress = localStorage.getItem("resolvedAddress");
                  console.log("Resolved Address:", resolvedAddress);
                  console.log("coords address:", address);
                  setDisplayAddress(resolvedAddress)
              } else {
                  console.log('use entered address');
                  setDisplayAddress(data.resolvedAddress);
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
          console.log('elemnt doesnt exist yet');
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

  const setDynamicBackdrop = (data) => {
    /** 
    if (data) {
        const weathercondition = data.days[dayIndex].hours[indexHour].conditions;
        const body = document.getElementById("body");
        const clear = "Clear";
        const cloudy = ["Partially cloudy", "Overcast"];
        const rainy = ["Rain, Partially cloudy", "Rain, Overcast"];

        if (weathercondition.includes(clear)) {
            body.classList.add(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/cloudy-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/rain-backdrop.jpeg')]`);
        } else if (cloudy.some(cond => cond.includes(weathercondition))) {
            body.classList.add(`bg-[url('/cloudy-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/rain-backdrop.jpeg')]`);
        } else if (rainy.some(cond => cond.includes(weathercondition))) {
            body.classList.add(`bg-[url('/rain-backdrop.jpeg')]`);
            body.classList.remove(`bg-[url('/clear-day-backdrop.jpg')]`);
            body.classList.remove(`bg-[url('/cloudy-backdrop.jpg')]`);
        }
    }*/
  }

useEffect(() => {setDynamicBackdrop()}, [data, indexHour, dayIndex]);
// Show loading screen when searching for data handled by the useQuery hook isLoading.
if (isLoading) { 
        return (
        <div className="bg-white place-items-center relative grid w-full h-screen">
                <span className="absolute top-1/3 ">
                <img src="rain-gif.gif" className='size-20'/>
                </span>
                <div className="plead-message absolute top-[55%]">
                    Fetching data...
                </div>
            </div>
        )
}
// Show error screen when error in query occurs handled by the useQuery hook isError.
if (isError) { 
    return (
    <div className="weather-app h-screen">
        <div className="error-message border border-zinc-400 bg-amber-100 relative grid place-self-center rounded place-content-center top-1/3 w-11/12">
            <img src="/mark.png" className="place-self-start p-2" />
            <p className="text-red-700 w-3/4 top-1/3 p-2">
                Error: {error.message}
            </p>
            <p className="text-red-700 w-3/4 p-2">
                Cause: {errMessage}
            </p>
        </div>
    </div>
    )
}

    return (
        <div 
        style={{ minHeight: '100vh' }}

        className='h-auto w-[100%] relative ' 
        id='body'>
            {/** Conditionally displayed general dialog box */}
            <div className="weather-app h-fit absolute z-50 grid place-self-center" id="dialog-box"
            >
                <div className="error-message border border-zinc-400 bg-slate-50 relative grid place-self-center rounded place-content-center top-1/3 w-11/12" 
                style={{
                    top: dialogMessage ? '100%' : '-100%',
                    transition: 'top 0.5s ease-in-out',
                    opacity: dialogMessage ? 1 : 0,
                    transitionDelay: dialogMessage ? '0.5s' : '0s',
                }}
                >
                <img src="/mark.png" className="place-self-start p-2" />
                {dialogMessage}
                </div>
            </div>

            {loading && address === "" ? (
                <Loading setPrompt={setPrompt} convertCoordinates={convertCoordinates} setLoading={setLoading} address={address} />
            ) : (prompt) ? (
                <div className="weather-app h-screen bg-slate-50" id="target">
                    <LocationForm address={address} setAddress={setAddress}
                    convertCoordinates={convertCoordinates} setPrompt={setPrompt} setLoading={setLoading} />
                </div>
            ) : dayPage ? (
                <Days 
                data={data} checkCountry={checkCountry} 
                Overview={Overview} indexHour={indexHour}
                RecentSearches={RecentSearches} address={address}
                setAddress={setAddress} setCurrentKey={setCurrentKey}
                setDisplayAddress={setDisplayAddress}
                recentSearch={recentSearch} showSetting={showSetting}
                settingsZ={settingsZ} sunPosition={sunPosition} 
                position={position} getTabWidth={getTabWidth} 
                tabWidth={tabWidth}
                setIndexHour={setIndexHour} setRecentSearch={setRecentSearch}
                setSettingZ={setSettingZ}
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
            ) : (
            <>
                <div id="weather-app" className={`weather-app-grid grid md: justify-items-center col-auto gap-5 md:gap-0 relative md:h-full z-20 overflow-clip`} 
                    onLoad={() => {
                        defaultTempUnit();
                        setDynamicBackdrop(data);
                        }
                    }
                    onClick={hideSettings}
                >
                    {/* Search bar section */}
                    <div className="search z-50 relative top-2 md:top-0 md:m-0 p-1 grid row-span-1 w-full max-h-[48px] ">
                        <form className="search absolute justify-self-center justify-items-center w-11/12 row-span-1 rounded-full mb-0" onSubmit={handleSubmit}>
                            <motion.input type="search"
                            value={query} 
                            className='search-icon search-bar w-full text-md md:mt-1 rounded-full focus:rounded-full focus:scale-[1] focus:bg-[#F5F5F5] focus-within:outline-none border border-neutral-300 focus:border-neutral-400 text-neutral-700 text-base
                            tracking-[0.0125] font-normal z-[50]'
                            name="place" id="place"
                            onLoad={() => checkCountry(passedCountry)}
                            onChange={InputValChange}
                            onFocus={joinSuggestions()}
                            style={{
                                
                                borderBottomLeftRadius: suggestions.length >= 1 ? 'none' : '',
                                borderBottomRightRadius: suggestions.length >= 1 ? 'none' : '',
                            }}
                            placeholder={displayAddress} />
                        </form> 
                        
                        {suggestions.length > 0 && (
                            <ul className=' absolute justify-self-center w-11/12 top-[2.6em] md:top-[2.95em] text-zinc-800 bg-neutral-100 border-1 border-neutral-400 rounded-b-2xl overflow-y-clip z-[50]'>
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className={`p-1 flex text-neutral-950 text-[17px] font-normal hover:opacity-70 `} onClick={
                                        () => {
                                            if (suggestions[0] !== "No search result found") {
                                                setQuery(suggestion);
                                                setSuggestions([]);
                                                searchLocation(index);
                                                console.log(passedCountry);
                                                console.log("the suggestion clicked was VALID")
                                            } else {
                                                setQuery(address);
                                                setSuggestions([]);
                                                console.log("Invalid suggestion cant be clicked")
                                            }
                                        }
                                        }> 
                                        <span className="search-image relative text-left "> <img src={`icons8-search-location-48.png`} alt="" srcSet="" className='size-5 inline ms-2' /> </span>
                                        <span className="suggestions relative w-[85%] left-1 text-justify">{suggestion}</span> </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Overview 
                    data={data} dayIndex={dayIndex} 
                    indexHour={indexHour} defaultTempUnit={defaultTempUnit}
                    tempSymbol={tempSymbol} iconBasePath={iconBasePath} />

                    <AIOverview data={data} dayIndex={dayIndex} address={currentKey} hour={indexHour} />

                    <HourlyList 
                    data={data} dayIndex={dayIndex} indexHour={indexHour} ref={{ listContainer, hourTimeRef }}
                    hourInfoRef={hourInfoRefs}
                    setIndexHour={setIndexHour} showRecentSearch={showRecentSearch}
                    hideRecentSearch={hideRecentSearch} hideSettings={hideSettings}
                    settingsZ={settingsZ} setSettingZ={setSettingZ}
                    defaultTempUnit={defaultTempUnit} 
                    showCurrentHour={showCurrentHour}
                    tempSymbol={tempSymbol} iconBasePath={iconBasePath} 
                    hourMinFormat={hourMinFormat}
                    />

                    <div className="daily forecast w-11/12 md:w-full md:max-h-[710px] bg-[#e5e5e580] p-3 mt-1 md:mt-0 mx-3 md:mx-0 md:mb-0 rounded-lg md:rounded-none ">
                        <div className="desc text-[17px] h-fit font-medium text-[#404C4F] py-2"> Daily Forecast  
                        </div>

                        <ul className=" max-h-auto">
                            {data?.days.slice(0, 10).map((day, index) => (
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
                        data={data}
                        indexHour={indexHour} address={address} 
                        setAddress={setAddress} currentKey={currentKey} 
                        setCurrentKey={setCurrentKey} query={query} setQuery={setQuery}
                        ref={{ tabRef, recentsRef }} setDisplayAddress={setDisplayAddress}
                        recentSearch={recentSearch} showSetting={showSetting}
                        hideRecentSearch={hideRecentSearch}
                        showRecentSearch={showRecentSearch}
                        setIndexHour={setIndexHour} checkCountry={checkCountry}
                        dayIndex={dayIndex} settingsZ={settingsZ}
                        tabWidth={tabWidth} setTabWidth={setTabWidth}
                        getTabWidth={getTabWidth}
                        setSettingZ={setSettingZ} 
                        defaultTempUnit={defaultTempUnit} 
                        tempSymbol={tempSymbol} displayAddress={displayAddress}
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
        </div>
    )
}

export default WeatherApp
