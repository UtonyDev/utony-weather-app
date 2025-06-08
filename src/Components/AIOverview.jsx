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
    const addressArray = address.split(',');
    const city = addressArray[0];
    const country = addressArray.length > 2 ? addressArray.at(-1) : addressArray[1];
    const date = data.days[dayIndex].datetime;

    if (isLoading) {
        // Placeholder for AI button animation
        const aiBar = document.querySelector('.aiBar');
        aiBar.innerHTML = "";
        aiBar.classList.add('animate-bar1');
        const aiBar2 = document.querySelector('.aiBar2');
        aiBar2.innerHTML = "";
        aiBar2.classList.add('animate-bar2');
    }

    const updateUI = (message) => {
        const aiBar = document.querySelector('.aiBar'); 
        const ogHeight = aiBar.offsetHeight;
        aiBar.innerHTML = `AI Overview for ${data.days[dayIndex].datetime} is ${message}`;
        console.log("The original height of the bar b4 is: ", ogHeight);
        aiBar.classList.remove('animate-bar1');
        const aiBar2 = document.querySelector('.aiBar2');
        aiBar2.innerHTML = "";
        aiBar2.classList.remove('animate-bar2');
        console.log("AI Overview completed");
    }
        
    const getAIOverview = async () => {
        console.log("AI Overview clicked");
        
        try {
            // play loading animation.
            setIsLoading(true);

            // Simulate data request by using a promise 
            const getDemoAISummary = () => {
                return new Promise((resolve, reject) => {
                    // Use timeout to simulate delay.
                    setTimeout(() => {
                        // Dummmy summary.
                        const testSummary = 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magnam, impedit provident culpa necessitatibus maxime reprehenderit odit in voluptates eius fugit? Eum minus quis voluptas dicta veniam sit facere quasi veritatis?'

                        // Simulate success and failure by using random.
                        const randnum = Math.floor(Math.random() * 2);
                        console.log("the random num is", randnum);
                        if (randnum) {
                            // Random number is 1 which is true
                            console.log("The simulated request was a success");
                            resolve(testSummary);
                        } else {
                            // Random number is 0 which is false.
                            console.log("The simulated request was a failure");
                            reject("Simulated Request Failed !! ") 
                        }
                        
                    }, 3000);
                })
            }
            
            console.log("Fetching dummy data...");
            const summary = await getDemoAISummary();

            // After the delay, reset the loading state so remove the animation.
            console.log("Fetched data successfully!");
            setIsLoading(false);
            
            // Update the UI after getting simulated data.
            updateUI(summary);
            
        } catch (error) {
            // Get the error returned.
            console.error("Error fetching AI overview:", error);
            // Reset the loading state and end animation.
            setIsLoading(false);
            // Update Ui with error 
            updateUI(error);
            return;
        }
    };

    return (
        <div className="aisection h-fit md:grid-rows-[32px_1fr] md:h-fit mx-0 relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[95%] md:mx-2 p-3 md:p-2 bg-[#e5e5e580] gap-1 shadow-md rounded-lg">
            
            <div className="aiHeader text-base font-semibold" onClick={getAIOverview}>
                <img src="/icons8-ai-96.png" alt="" className='inline-block mr-2 size-6' />
                <span className='aiBar cursor-pointer m-0 p-0 h-1/4'>
                    AI Overview
                </span>
                <span className="aiBar2 cursor-pointer m-0 p-0 h-1/4">
        
                </span>
                
            </div>
        </div>
    );
}
export default AIOverview;