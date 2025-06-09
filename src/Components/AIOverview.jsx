import './weather.css';
import '../index.css';
import '../App.css';
import axios from "axios";
import { useState } from 'react';

const AIOverview = ({ data, dayIndex, address, hour }) => {
    const [isLoading, setIsLoading] = useState(false);

/** 
    if (data) {
        console.log(data.address);
        const addressArray = data.address.split(',');
        const city = addressArray[0];
        const country = addressArray.length > 2 ? addressArray.at(-1) : addressArray[1];
        console.log(`the city and country needed for the AI summary is ${city} and ${country} and the date is ${data.days[dayIndex].datetime}`)
    }*/
    const addressArray = address.split(':');
    console.log("The address from the address state: ", addressArray);
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
        aiBar.innerHTML = `${message}`;
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

            /** Simulate data request by using a promise 
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
            const summary = await getDemoAISummary();*/ 
            
            // Fetch the AI summary from the server.
            console.log("Fetching AI summary...");
            const url = `https://my-julia-server-api.onrender.com/weather?city=${city}&country=${country}&date=${date}`;
            console.log("The url is: ", url)
            const response = await axios.get(url);
            console.log("The raw response is: ", response);

            // Access the data from the promise object.
            const summary = await response.data;
            console.log("The response summary is: ", summary);

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
        <div className="aisection h-fit md:grid-rows-[32px_1fr] md:h-fit mx-0 relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[95%] md:mx-2 p-3 md:p-2 md:bottom-1 bg-[#e5e5e580] gap-0 shadow-md rounded-lg" onClick={getAIOverview}>
            
            <div className="title text-[17px] font-medium md:h-fit text-[#404C4F]" >
                <img src="/icons8-ai-96.png" alt="" className='inline-block mr-2 size-4' />
                AI Overview
            </div>

            <div className="aiContent relative " >  
                <span className='aiBar cursor-pointer m-0 p-0 h-1/4 md:h-1/2 rounded-2xl'> 
                </span>
                <span className="aiBar2 absolute cursor-pointer m-0 p-0 h-1/4 rounded-2xl">
                </span>
                
            </div>
        </div>
    );
}
export default AIOverview;