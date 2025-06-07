import './weather.css';
import '../index.css';
import '../App.css';
import { useState } from 'react';

const AIOverview = ({ data, dayIndex }) => {
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        // Placeholder for AI button animation
        const aiBar = document.querySelector('.aiBar');
        aiBar.innerHTML = "";
        aiBar.classList.add('animate-bar1');
        const aiBar2 = document.querySelector('.aiBar2');
        aiBar2.innerHTML = "";
        aiBar2.classList.add('animate-bar2');
    } 
        
    const getAIOverview = async () => {
        // Placeholder for AI overview functionality
        console.log("AI Overview clicked");
        console.log("the day index is: ", dayIndex);
        console.log("the available data is: ", data.days[dayIndex]);
        // You can implement the actual functionality here
        setIsLoading(true);
        // Simulate a delay to mimic an API call or processing time
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate a delay
        // After the delay, reset the loading state
        setIsLoading(false);
        console.log("AI Overview completed");
        // You can also update the UI or state here if needed
        const aiBar = document.querySelector('.aiBar');
        aiBar.innerHTML = `AI Overview for ${data.days[dayIndex].datetime}`;
        aiBar.classList.remove('animate-bar1');
        const aiBar2 = document.querySelector('.aiBar2');
        aiBar2.innerHTML = "";
        aiBar2.classList.remove('animate-bar2');
    };

    return (
        <div className="aisection h-fit md:grid-rows-[32px_1fr] md:h-fit mx-0 relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[95%] md:mx-2 p-3 md:p-2 bg-[#e5e5e580] gap-1 shadow-md rounded-lg ">
            
            <div className="aiHeader text-xl font-semibold" onClick={getAIOverview}>
                <img src="/icons8-ai-96.png" alt="" className='inline-block mr-2 size-6' />
                <span className='aiBar cursor-pointer h-1/4 m-0 p-0'>
                    AI Overview
                </span>
                <span className="aiBar2 cursor-pointer h-1/4 m-0 p-0">
        
                </span>
                
            </div>
        </div>
    );
}
export default AIOverview;