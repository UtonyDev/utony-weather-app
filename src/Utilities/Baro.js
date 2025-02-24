export const baroPercent = (pressure) => {
    const perCent = ( pressure * 100 ) / ( 1013.25 * 1.125); // 1.2 added for scalling
    return perCent;
    }
    