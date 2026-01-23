import SunCalc from "suncalc";

export type DuskDecision = {
  sunsetTime: Date;
  shouldTrigger: boolean;
};

export function decideDuskTrigger(now: Date, lat: number, lon: number): DuskDecision {
  const times = SunCalc.getTimes(now, lat, lon);
  const sunsetTime = times.sunset;
  const shouldTrigger = sunsetTime.getTime() - now.getTime() < 0.5 * 3600 * 1000;
  return { sunsetTime, shouldTrigger };
}

