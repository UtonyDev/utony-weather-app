export const getPhaseType = (phase) => {
    if (phase == 0) { return `new-moon-phase`};
    if (phase > 0 && phase < 0.25) { return `waxing-crescent-phase`};
    if (phase == 0.25) { return `first-quarter-phase`};
    if (phase > 0.25 && phase < 0.5) { return `waxing-gibbous-phase`};
    if (phase == 0.5) { return `full-moon-phase`};
    if (phase > 0.5 && phase < 0.75) { return `waning-gibbous-phase`};
    if (phase == 0.75) { return `last-quarter-phase`};
    if (phase > 0.75 && phase < 1) { return `waning-crescent-phase`};
  }

export const getPhaseInfo = (phase) => {
    if (phase == 0) { return `New Moon`};
    if (phase > 0 && phase < 0.25) { return `Waxing Crescent`};
    if (phase == 0.25) { return `First Quarter`};
    if (phase > 0.25 && phase < 0.5) { return `Waxing Gibbous`};
    if (phase == 0.5) { return `Full Moon`};
    if (phase > 0.5 && phase < 0.75) { return `Waning Gibbous`};
    if (phase == 0.75) { return `Last Quarter`};
    if (phase > 0.75 && phase < 1) { return `Waning crescent`};
  }


  