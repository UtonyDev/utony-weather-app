import { useState, useRef, useEffect } from "react";
import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import "./weather.css";
import "../weatherapp.css";
import "../index.css";

const HourlyList = forwardRef(
  (
    {
      data,
      dayIndex,
      showCurrentHour,
      indexHour,
      setIndexHour,
      hourInfoRef, // Array of refs passed from parent
      showRecentSearch,
      hideRecentSearch,
      hourMinFormat,
      defaultTempUnit,
      tempSymbol,
      setSettingZ,
    },
    ref
  ) => {
    const [highlightedHour, setHighlightedHour] = useState(0);
    const { listContainer, hourTimeRef } = ref;
    const iconBasePath = "/GWeatherIcons/";

    useEffect(() => {
      // Highlight the current hour
      const hourTime = document.querySelectorAll(".hour-time");
      if (hourTime[indexHour]) {
        hourTime[indexHour].classList.add(
          "bg-teal-100",
          "rounded-md",
          "p-1",
          "text-teal-600"
        );
        setHighlightedHour(indexHour);
      }
      return () => {
        if (highlightedHour !== null && hourTime[highlightedHour]) {
          hourTime[highlightedHour].classList.remove(
            "bg-teal-100",
            "rounded-md",
            "p-1",
            "text-teal-600"
          );
        }
      };
    }, [indexHour, highlightedHour]);

    return (
      <div className="hourly md:grid-rows-[32px_1fr] md:h-fit mx-0 relative forecast grid grid-rows-1 justify-self-center w-11/12 md:w-[95%] md:mx-2 p-3 md:p-2 bg-[rgba(229,229,229,.5)] gap-1 shadow-md rounded-lg">
        <div className="desc text-[18px] font-medium md:h-fit flex justify-between text-neutral-600">
          Hourly Forecast
          <img
            src="./history.ico"
            alt=""
            className="search-history size-5 md:hidden"
            onClick={() => {
              showRecentSearch();
              setSettingZ(true);
            }}
          />
        </div>
        <ul
          className="list-container flex p- overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth"
          ref={listContainer}
        >
          {data.days[dayIndex].hours.map((hour, index) => (
            <motion.li
              key={index}
              className="hour-info bg-[#F9F9FB] p-4 md:p-2 me-3 rounded-md"
              ref={(el) => (hourInfoRef.current[index] = el)} // Assign ref to each hour-info element
              onClick={() => setIndexHour(index)}
              onLoad={showCurrentHour}
            >
              <p
                className="py-1 hour-time text-[#505058] font-sans font-normal tracking-wide text-center"
                ref={hourTimeRef}
              >
                {hourMinFormat(hour.datetime)}
              </p>
              <p className="py-1 text-[#008080] tracking-wide text-center">
                {defaultTempUnit(hour.temp)}
                {tempSymbol()}
              </p>
              <p className="py-1 text-[#505058]">
                <img
                  src={`${iconBasePath}${hour.icon}.png`}
                  alt=""
                  className="src size-6 place-self-center"
                />
              </p>
              <p className="py-1 text-[#505058] font-sans font-normal tracking-wide text-center">
                {Math.round(data.days[dayIndex].hours[indexHour].precipprob)}%
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  }
);

export default HourlyList;