import React, { useState, useRef, useEffect, useMemo } from 'react';
import './weather.css';
import '../index.css';
import '../App.css';

const CurrentConditions = React.memo(({ 
    data, dayIndex, indexHour, defaultTempUnit,
    hourMinFormat, precipType, bearingConversion, getHumidityColor, toKiloM, getHumidityBGColor, getHumidityTxtColor, baroPercent, UVLevel, getPhaseType, getPhaseInfo, position}) => {

        console.log(indexHour); 
    return (
        <div className="current conditions justify-self-center w-11/12 relative md:w-[97%]">
        <div className="desc text-[18px]/6 font-normal text-black py-2 ps-2"> Conditions </div>
    <div className="weather-elements p-0 flex flex-wrap w-full justify-around">

        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="precip cards shadow-sm mt-4 p-2 align-middle bg-[#e5e5e580] w-full min-h-[275px] md:min-h-[225px] rounded-lg ">
            <div className="desc text-base/4 font-normal text-[#404C4F]">Precipitation</div>
                    <p className='ps-1 pe-2 py-3 text-3xl font-normal text-blue-500'> {Math.round(data.days[dayIndex].hours[indexHour].precipprob)}% </p>
                    <p className="raininfo my-2 text-sm text-neutral-700">Chance of rain</p>
                    <hr className='my-2 text-neutral-200' />                  
                    <p className='py-1 font-normal text-sm text-neutral-700'> {precipType(data.days[dayIndex].hours[indexHour].preciptype, data.days[dayIndex].precip, data.days[dayIndex].hours[indexHour].snow, data.days[dayIndex].hours[indexHour].snowdepth)} </p> 
            </div>
        </div>

        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="humid cards shadow-sm mt-4 p-2 align-middle bg-[rgba(229,229,229,.5)] w-full min-h-[275px] md:min-h-[225px] rounded-lg " >
                        <div className="desc text-base/4 font-normal text-[#404C4F]"> Humidity </div>
                        <div className="humid-meter place-self-center">
                            <div className="ms-4 mt-2 text-sm text-zinc-400">100</div>
                            <p className={`auto grid-xl-zinc-200 shadow-lg relative px-6 h-20 w-fit m-1 rounded-full overflow-hidden transition-all`}
                            style={{
                                backgroundColor: getHumidityColor((data.days[dayIndex].hours[indexHour].humidity))
                            }}>
                            <span className={`level absolute left-0 top-full transform -translate-y-full w-full px-6 rounded-sm transition-all`}
                                    style={{
                                        height: `${(data.days[dayIndex].hours[indexHour].humidity)}%`,
                                        backgroundColor: getHumidityBGColor((data.days[dayIndex].hours[indexHour].humidity))
                                        }}>
                                    <span className={`humid text-xl px-0 py-[10%] w-full font-semibold font-sans  absolute left-[15%] top-3/4 transform -translate-y-full transition-all`}
                                    style={{
                                        color: getHumidityTxtColor((data.days[dayIndex].hours[indexHour].humidity))
                                    }}>
                                        {Math.round(data.days[dayIndex].hours[indexHour].humidity)}%
                                    </span>
                            </span>
                            </p> <div className="ms-6 mb-2 text-sm text-zinc-400"> 0 </div>
                        </div>
                        <p className='py-1 inline'> 
                            <span className="dew inline-block rounded-full p-1 text-center text-green-700 bg-green-300 font-semibold font-sans">
                            {Math.round(defaultTempUnit(data.days[dayIndex].hours[indexHour].dew))}°</span> <span className="wr text-[#505058] inline-block">Dew point</span>  </p>                       
            </div>
        </div>

        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="pressure cards shadow-sm mt-4 p-2 align-middle bg-[#e5e5e580] w-full min-h-[275px] md:min-h-[225px] rounded-lg md:h-[192px]">
                <div className="desc text-base/4 font-normal text-[#404C4F]"> Pressure </div>
                <div className="pressure-meter place-self-center mt-6">
                    <div className="p_ring relative w-16 h-16 m-2 rounded-full">
                    
                    <div className="progress absolute w-full h-full rounded-full transition-all"
                    style={{
                        background: `conic-gradient(
                        from 195deg,
                        #0ea5e9 20%,
                        #0ea5e9 ${baroPercent(data.days[dayIndex].hours[indexHour].pressure)}%,
                        #bae6fd 50%,
                        #bae6fd 100%
                        )`,
                        mask: `radial-gradient(circle, transparent 55%, black 55%)`,
                    }} 
                    
                    ></div>
                </div>
                <span className="h relative bottom-4 ms-3 text-xs z-[60] text-zinc-400">low</span>
                <span className="l relative bottom-4 ms-4 text-xs z-[60] text-zinc-400">high</span>
                </div>
                <p className='py-1 text-[#505058]'> 
                    <span className="pval font-medium text-base font-sans">{data.days[dayIndex].hours[indexHour].pressure}</span> mb 
                </p>
            </div>
        </div>

        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="wind cards shadow-sm mt-4 p-2 align-middle bg-[rgba(229,229,229,.5)] relative w-full min-h-[275px] md:min-h-[200px] rounded-lg ">
                <div className="desc text-base/4 font-normal text-[#404C4F] bold">Wind</div>

                <div className="compass grid">
                    <div className="north text-sm  justify-self-center text-zinc-400">N</div>
                    <div className="east text-sm  justify-self-end translate-y-1/3 relative top-full text-zinc-400">E</div>
                    <div 
                    className="arrow justify-self-center text-4xl"
                    >
                        <img src="/compass.png" alt="" srcSet="" className='w-6 h-6 transition-all'
                        style={{
                            transform: `rotate(${data.days[dayIndex].hours[indexHour].winddir}deg)`,
                            }}/>
                        
                    </div>
                    <div className="west text-sm relative bottom-full text-zinc-400">W</div>
                    <div className="south text-sm justify-self-center text-zinc-400">S</div>
                </div>
                <p className='py-1 text-neutral-700 font-medium'> {bearingConversion(data.days[dayIndex].hours[indexHour].winddir)} </p>
                <hr className='my-1 text-neutral-200' />
                <p className='py-1 text-neutral-700'> 
                    <span className="speed text-lg font-normal"> {toKiloM(data.days[dayIndex].hours[indexHour].windspeed)} </span>
                    km/h
                </p>
            </div>
        </div>
        
        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="visible cards shadow-sm mt-4 p-2 relative w-full md:h-[192px] align-middle bg-[rgba(229,229,229,0.5)] min-h-[275px] md:min-h-[225px] rounded-lg">
                    <div className="desc text-base/4 font-normal text-[#404C4F]">Visibility</div>
                    <img src="/horizon.png" alt="" className="m-4" />
                    <p className=' text-neutral-700 font-normal font-sans'> <img src="/visibility.png" alt="" className='me-1 inline-block'/>
                        {toKiloM(data.days[dayIndex].hours[indexHour].visibility)} km
                    </p>
                    <p className='py-1  text-neutral-700 font-normal font-sans'> <img src="/cloud-cover.png" alt="" className="me-1 inline-block" />
                        <span className="cloud inline-block"> {data.days[dayIndex].hours[indexHour].cloudcover} %</span> Cloud cover
                    </p>                                                
            </div>
        </div>
    
        <div className="card-column flex-1/2 basis-[44vw] ps-1 pe-2 max-w-1/2 md:flex-1/3 md:max-w-[32%]">
            <div className="solar cards shadow-sm w-full mt-4 p-2 align-middle bg-[rgba(229,229,229,.5)] relative min-h-[275px] rounded-lg md:min-h-[225px]">
                    <div className="desc text-base/4 font-normal text-[#404C4F]">UV Index</div>

                    <div className="uvmeter relative place-self-center p-1 h-fit">
                    <div className="ms-8 relative top-3 text-sm text-zinc-400">11+</div>
                        <div className="currentUV absolute -left-1 text-amber-800 min-h-[76px]"
                        > <span className="currentUVLevel mb-1 block relative transition-all"
                        style={{
                           transform: `translate(${0}px, ${76 - UVLevel(data.days[dayIndex].hours[indexHour].uvindex)}px)`,
                        }} 
                        > {data.days[dayIndex].hours[indexHour].uvindex}</span>  </div>

                        <div className="sun relative w-16 h-16 m-3 bg-amber-400 rounded-full overflow-clip">
                            <div className="lev absolute bottom-0  bg-red-600 w-full" 
                            style={{
                                height: `${UVLevel(data.days[dayIndex].hours[indexHour].uvindex)}%`,
                            }}></div>
                        </div>
                    <div className="ms-10 relative bottom-3 text-sm text-zinc-400">0</div>
                    </div>

                    <p className='py-1 text-[#505058] '> <img src="/sunrays.png" alt="" className="ray inline-block text-[#505058]" /> {data.days[dayIndex].hours[indexHour].solarradiation} W/m² </p>
                </div>
        </div>
    </div>
    
    <div className="phases grid row-auto grid-cols-3 col-span-2 w-[98%] h-fit p-2 cards shadow-sm mt-8 align-middle bg-[rgba(229,229,229,.5)] place-self-center relative bottom-[2%] rounded-lg ">
        <div className="desc text-base font-normal text-[#404C4F]"> Astro </div>
        
        <div className="sun-phase col-start-1 col-end-1">

            <div className="sunrise ">
                <h1 className=' font-normal text-[15px] text-[#505058]'> Sunrise </h1>
                <p className='py-1 text-[16px] font-medium text-amber-800 '> {hourMinFormat(data.days[dayIndex].sunrise)} </p>
            </div>

            <div className="sunset ">
                <h1 className=' font-normal text-[15px] text-[#505058]'> Sunset </h1>
                <p className='py-1 text-[16px] font-medium text-amber-800'>{hourMinFormat(data.days[dayIndex].sunset)} </p>
            </div> 
        </div>

        <div className="horizon-graph place-self-center relative">
            <span className="celestial-body">
                <img src={`/GWeatherIcons/clear-day.png`} alt="" className={`size-5 absolute  p-0 m-0 transition-all z-50`} 
                style={{ left: `${position.x}px`, top: `${position.y}px` }}/>
            </span>
            <div className="graph flex flex-row relative">
            <span className="dawn border-t-1 border-1 rounded-bl-0 rounded-br-[40px] w-[30px] h-[15px] absolute top-[30px] left-[-30px] border-neutral-500" 
            style={{
                background: `linear-gradient(to right, #64B5F6 ${position.x + 40}px, transparent ${position.x}px)`,
            }}></span>
            <div className="semicircle bg-sky-300 border-1 rounded-tl-[40px] rounded-tr-[40px] border-b-1 border-neutral-500 w-[60px] h-[30px]"
            style={{
                background: `linear-gradient(to right, #64B5F6 ${position.x + 10}px, transparent ${position.x}px)`,
            }} ></div>
            <span className="dusk border-t-1 border-1 rounded-bl-[40px] rounded-br-0 w-[30px] h-[15px] absolute top-[30px] left-[60px] border-neutral-500" 
            style={{
                background: `linear-gradient(to right, #64B5F6 ${position.x - 100 }px, transparent ${position.x}px)`,
            }}></span>
            </div>
        </div>


        <div className="moon mx-5">
            <div className=" font-normal text-[15px] text-[#505058]"> Moon </div>
            <img src={`/moon-phases/${getPhaseType(data.days[dayIndex].moonphase)}.png`} alt="" srcSet="" />
            <h1 className="moon-info font-medium text-amber-800"> {getPhaseInfo(data.days[dayIndex].moonphase)} </h1>

        </div>
                    
    </div>    
</div>
);
});
 export default CurrentConditions;