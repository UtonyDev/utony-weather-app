export const precipType = (type, amount, snowamount, snowdepth ) => {
    const rainmessage = `${amount}, mm  of rainfall` 
    const snowmessage = `${snowamount}, cm  of snow with ${snowdepth} cm Depth`;
  
    if (type === null) {
        return 'No Current Precipitation'; 
    } else if (type.includes('rain' && 'snow')
    ) {
        return (rainmessage, snowmessage);
    } else if (type.includes('rain')) {
        return (rainmessage);
    } else if (type.includes('rain')) {
        return (snowmessage);
    }
  }
  
