import { CAMP_CENTER } from '../data/campPoints';

const LAT_RANGE = 0.0035;
const LNG_RANGE = 0.005;

export function geoToPercent(lat: number, lng: number) {
  const x = ((lng - (CAMP_CENTER.lng - LNG_RANGE)) / (LNG_RANGE * 2)) * 100;
  const y = (1 - (lat - (CAMP_CENTER.lat - LAT_RANGE)) / (LAT_RANGE * 2)) * 100;

  return { x, y };
}
