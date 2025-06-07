import './weather.css';
import '../index.css';
import '../App.css';
import React, { createElement } from 'react';

const AIOverview = ({ data, dayIndex }) => {
    const aiButtonAnimation = () => {
        // Placeholder for AI button animation
        const aiBar = document.querySelector('.aiBar');
        const aiBar2 = document.querySelector('.aiBar2');
        aiBar.innerHTML = `...`;
        aiBar2.innerHTML = `...`;
        aiBar.classList.add('animate-bars');
        aiBar2.classList.add('animate-bars2');

    }

    const getAIOverview = () => {
        // Placeholder for AI overview functionality
        console.log("AI Overview clicked");
        console.log("the day index is: ", dayIndex);
        console.log("the available data is: ", data.days[dayIndex]);
        // You can implement the actual functionality here
        aiButtonAnimation();
    };

    return (
        <div className="aisection md:grid-rows-[32px_1fr] md:h-fit mx-0 relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[95%] md:mx-2 p-3 md:p-2 bg-[#e5e5e580] gap-1 shadow-md rounded-lg h-max">
            
            <h1 className="aiHeader text-xl font-semibold" onClick={getAIOverview}>
                <img src="/icons8-ai-96.png" alt="" className='inline-block mr-2 size-6' />
                <span className='aiBar cursor-pointer hover:text-teal-600 h-1/2'>
                    Get AI Overview
                </span>
                <span className='aiBar2 cursor-pointer hover:text-teal-600 h-1/2'>
                </span>
            </h1>
        </div>
    );
}
export default AIOverview;