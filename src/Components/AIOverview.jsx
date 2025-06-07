import './weather.css';
import '../index.css';
import '../App.css';
import { useState } from 'react';

const AIOverview = ({ data, dayIndex, address }) => {
    const [isLoading, setIsLoading] = useState(false);

/** 
    if (data) {
        console.log(data.address);
        const addressArray = data.address.split(',');
        const city = addressArray[0];
        const country = addressArray.length > 2 ? addressArray.at(-1) : addressArray[1];
        console.log(`the city and country needed for the AI summary is ${city} and ${country} and the date is ${data.days[dayIndex].datetime}`)
    }*/
   console.log('the address is ', address);
    const addressArray = address.split(',');
    const city = addressArray[0];
    const country = addressArray.length > 2 ? addressArray.at(-1) : addressArray[1];
    const date = data.days[dayIndex].datetime;
    console.log('the date is ', typeof date);
    console.log(`the city and country needed for the AI summary is ${city} and ${country} and the date is ${data.days[dayIndex].datetime}`);

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
        
        try {
            // You can implement the actual functionality here
        setIsLoading(true);
        // Simulate a delay to mimic an API call or processing time
        const url = `http://localhost:8000/weather?city=${city}&country=${country}&date=${date}}`;
        console.log('the base url is ', url);

        const res = await fetch(url)

        const sum = await res.json();
        console.log('the AI summary is ', sum);

        return sum;
        }
        catch (error) {
            console.error("Error fetching AI overview:", error);
            setIsLoading(false);
            return;
        }
        console.log('the AI summary ought to be ', sum)
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