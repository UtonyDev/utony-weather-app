import { useState, useRef, useEffect } from 'react'
import './weather.css';
import '../App.css';
import '../index.css';

const HourlyList = ({ 
    data, dayIndex, indexHour, showCurrentHour,
    hourMinFormat, defaultTempUnit,
    tempSymbol, hourTimeRef, hourInfoRef
}) => {

    let symb;

    const iconBasePath = '/GWeatherIcons/';

    const highlightCurrentHour = () => {
        const hourTime = document.querySelectorAll('.hour-time');
        if (hourTime[indexHour]) {
            hourTime[indexHour].classList.add('bg-teal-100');
            hourTime[indexHour].classList.add('rounded-md');
            hourTime[indexHour].classList.add('p-1');
            hourTime[indexHour].classList.add('text-teal-600');
        }
    }
    useEffect(() =>{highlightCurrentHour()});
    ;

    return (
    <div className="hourly md:grid-rows-[32px_1fr] md:h-fit  relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[97%] md:mx-4 md:m-3 p-3 bg-[rgba(229,229,229,.5)] gap-1 shadow-md rounded-lg">
    <div className="desc text-xl font-medium md:h-fit  text-neutral-600 "> Hourly Forecast </div>
    <ul className="flex p-1 overflow-x-auto whitespace-nowrap">
        {data.days[dayIndex].hours.map((hour, index) => (
        <li 
        key={index} 
        className="hour-info bg-[#F9F9FB] p-4 me-3 rounded-md"
        ref={(el) => (hourInfoRef.current[index] = el)}
        onLoad={showCurrentHour}>
            <p 
                className='py-1 hour-time text-[#505058] font-sans font-normal tracking-wide text-center'
                ref={(el) => (hourTimeRef.current[index] = el)}
                >{hourMinFormat(hour.datetime)}</p>
            <p className='py-1 text-[#008080] tracking-wide text-center'>{defaultTempUnit(hour.temp)}{tempSymbol(symb)}</p>
            <p className='py-1 text-[#505058]'><img src={`${iconBasePath}${hour.icon}.png`} alt="" className="src size-6 place-self-center" /></p>
            <p className='py-1 text-[#505058] font-sans font-normal tracking-wide text-center'> {Math.round(data.days[dayIndex].hours[indexHour].precipprob)}% </p>
        </li>
        ))}
    </ul>
</div>);
}

export default HourlyList;