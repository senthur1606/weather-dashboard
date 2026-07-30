import React from "react";
import { useSelector } from "react-redux";
import "../styles/weather-effects.css";

const WeatherBackground = () => {
  const weather = useSelector((state) => state.weather.current);

  const condition = (
    weather?.condition ||
    weather?.current?.condition ||
    "clear"
  ).toLowerCase();

  const isCloudy = ["cloudy", "clouds", "overcast"].includes(condition);
  const isRain = ["rain", "rainy", "drizzle"].includes(condition);
  const isThunder = ["thunder", "thunderstorm", "storm"].includes(condition);
  const isSnow = ["snow"].includes(condition);
  const isFog = ["fog", "mist", "haze"].includes(condition);
  const isClear = ["clear", "sunny"].includes(condition);

  return (
    <div className="weather-effects">

      {isCloudy && (
        <>
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </>
      )}

      {isRain && (
        <div className="rain">
          {Array.from({ length: 120 }).map((_, i) => (
            <span
              key={i}
              className="drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.8 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {isThunder && (
        <>
          <div className="rain">
            {Array.from({ length: 120 }).map((_, i) => (
              <span
                key={i}
                className="drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random()}s`,
                }}
              />
            ))}
          </div>

          <div className="lightning"></div>
        </>
      )}

      {isSnow && (
        <div className="snow">
          {Array.from({ length: 80 }).map((_, i) => (
            <span
              key={i}
              className="flake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {isFog && (
        <div className="fog"></div>
      )}

      {isClear && (
        <div className="sun-glow"></div>
      )}

    </div>
  );
};

export default WeatherBackground;