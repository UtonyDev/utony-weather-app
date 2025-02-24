export const getHumidityColor = (humidity) => {
    if (humidity >= 0 && humidity < 30) return '#bef264'; // lime-300
    if (humidity >= 30 && humidity < 60) return '#7dd3fc'; // sky-300
    if (humidity >= 60 && humidity <= 100) return '#fdba74'; // orange-300
    return '#6b7280'; // gray-600 (consistent default)
  };
  
  export const getHumidityBGColor = (humidity) => {
    if (humidity >= 0 && humidity < 30) return '#65a30d'; // lime-600
    if (humidity >= 30 && humidity < 60) return '#0284c7'; // sky-600
    if (humidity >= 60 && humidity <= 100) return '#ea580c'; // orange-600
    return '#6b7280'; // gray-600
  };
  
  export const getHumidityTxtColor = (humidity) => getHumidityColor(humidity); // Reuse logic
  