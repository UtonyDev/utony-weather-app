export const bearingConversion = (wcb) => {
    if (wcb >= 0 && wcb < 90) { 
        return `N${Math.round(wcb)}E`;
    } else if (wcb >= 90 && wcb < 180) {
        return `N${Math.round(180 - wcb)}E`;
    } else if (wcb >= 180 && wcb < 270) {
        return `S${Math.round(wcb - 180)}W`;
    } else if (wcb >= 270 && wcb < 360) {
        return `S${Math.round(360 - wcb)}E`
    }
  }
  
export const toKiloM = (mph) => {
    const kmh = Math.round(mph * 1.60934);
    return kmh;
  }
  