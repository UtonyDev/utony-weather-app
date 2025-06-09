import { useState } from 'react';
import './weather.css';
import '../index.css';
import '../App.css';

function Overview({ 
    data, indexHour, defaultTempUnit, dayIndex ,
    tempSymbol
     }) {

        let symb;
        const iconBasePath = '/GWeatherIcons/';
    return (
        <div className="overview grid grid-auto md:self-end md:py-0 grid-cols-2 mt-5 md:my-4 row-auto justify-self-center relative w-11/12 px-6 py-4 gap-3 z-40">

            <div className="conditions text-[17px] font-medium tracking-wider text-[#202e31] relative ms-[15%] place-self-center left-[-10%] col-span-2">{data.days[dayIndex].hours[indexHour].conditions} 
                <img loading="lazy" src={`${iconBasePath}${data.days[dayIndex].hours[indexHour].icon}.png`} alt="" className="src size-10 place-self-center" />
            </div>

            <h1 className="main-temp justify-self-center col-span-2 text-teal-900 lining- leading-snug mb-2">
                <span className="text-8xl font-medium">
                    {defaultTempUnit(data.days[dayIndex].hours[indexHour].temp)}
                </span>
                <span className="text-6xl relative bottom-1/4">°</span>
            </h1>

            <div className="feelslike justify-self-center col-span-2 relative left-[-5%]"> 
                <span className='text-base/4 font-normal tracking-wide text-[#1e2425]'>Feels like </span> 
                <span className="text-teal-900 font-medium text-lg">
                    {defaultTempUnit(data.days[dayIndex].hours[indexHour].feelslike)}{tempSymbol(symb)}
                </span> 
            </div>

            <div className="high-temp place-self-end me-[20%]" > 
                <h2 className='text-base/4 font-normal tracking-wide text-[#1e2425]'>High</h2> 
                <span className="text-teal-900 font-medium text-lg">
                    {defaultTempUnit(data.days[dayIndex].tempmax)}{tempSymbol(symb)} 
                </span>
            </div>
            <div className="low-temp  place-self-start ms-[15%]"> 
                <h2 className='text-base/4 font-normal tracking-wide text-[#1e2425]'>Low</h2>
                <span className="text-teal-900 font-medium text-lg">
                    {defaultTempUnit(data.days[dayIndex].tempmin)}{tempSymbol(symb)}
                </span>
            </div>
        </div>
    );
}

export default Overview;
