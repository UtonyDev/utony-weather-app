import { useState } from 'react';
import './weather.css';
import '../index.css';
import '../App.css';

function Overview({ 
    data,  indexHour, defaultTempUnit, dayIndex ,
    tempSymbol, iconBasePath
     }) {

        let symb;
    return (
        <div className="temp-comp grid grid-auto grid-cols-2 row-auto justify-self-center w-11/12 px-6 py-4 gap-3 z-40">
            <h1 className="avg-temp justify-self-center col-span-2 text-teal-900 lining- leading-snug mb-2">
                <span className="text-8xl font-medium">
                    {defaultTempUnit(data.days[dayIndex].hours[indexHour].temp)}
                </span>
                <span className="text-6xl relative bottom-1/4">°</span>
            </h1>

            <div className="feelslike justify-self-center col-span-1 relative left-[17%] line-clamp-2 "> 
                <div className='text-sm text-[#545454] font-medium'>Feels like</div> 
                <span className="text-[#008080] font-medium">
                    {defaultTempUnit(data.days[dayIndex].hours[indexHour].feelslike)}{tempSymbol(symb)}
                </span> 
            </div>

            <div className="conditions text-sm text-[#545454] font-medium relative place-self-start ms-[15%] col-span-1 row-span-1">{data.days[dayIndex].hours[indexHour].conditions} 
                <img src={`${iconBasePath}${data.days[dayIndex].hours[indexHour].icon}.png`} alt="" className="src size-10" />
            </div>

            <div className="high-temp place-self-center ms-[15%]" > 
                <h2 className='text-[#545454] font-medium'>High</h2> 
                <span className="text-[#008080] font-medium">
                    {defaultTempUnit(data.days[dayIndex].tempmax)}{tempSymbol(symb)} 
                </span>
            </div>
            <div className="low-temp  place-self-start ms-[15%]"> 
                <h2 className='text-[#545454] font-medium'>Low</h2>
                <span className="text-[#008080] font-medium">
                    {defaultTempUnit(data.days[dayIndex].tempmin)}{tempSymbol(symb)}
                </span>
            </div>
        </div>
    );
}

export default Overview;
