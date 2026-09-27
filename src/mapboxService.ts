import { MAPBOX_TOKEN } from './distanceConstants';

const geocodeCache: Record<string, [number, number]> = {};

export const geocode = async (address: string): Promise<[number, number]> => {
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`);
  const data = await res.json();
  if (data.message) {
    throw new Error(`Mapbox API Error: ${data.message} (Is your Mapbox Token set?)`);
  }
  if (data.features && data.features.length > 0) {
    const coords = data.features[0].center as [number, number];
    geocodeCache[address] = coords;
    return coords;
  }
  throw new Error("Address not found: " + address);
};

export const getMatrix = async (dest: [number, number], origins: [number, number][]): Promise<{distances: number[], durations: number[]}> => {
  const results = { distances: [] as number[], durations: [] as number[] };
  
  // Chunk origins into groups of 24 (Matrix API limit is 25 coordinates total per request)
  for (let i = 0; i < origins.length; i += 24) {
    const chunk = origins.slice(i, i + 24);
    const coords = [dest, ...chunk];
    const coordsString = coords.map(c => `${c[0]},${c[1]}`).join(';');
    
    // dest is index 0. Sources are 1 to chunk.length
    const sources = Array.from({ length: chunk.length }, (_, i) => i + 1).join(';');
    const destinations = '0';
    
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordsString}?annotations=distance,duration&sources=${sources}&destinations=${destinations}&access_token=${MAPBOX_TOKEN}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === 'Ok') {
      // data.distances[source_index][destination_index]
      chunk.forEach((_, idx) => {
        // Mapbox returns distances in meters, durations in seconds
        // convert distance to miles
        const distMeters = data.distances[idx][0];
        const distMiles = distMeters * 0.000621371;
        
        const durationSecs = data.durations[idx][0];
        
        results.distances.push(distMiles);
        results.durations.push(durationSecs);
      });
    } else {
      throw new Error("Matrix API failed");
    }
  }
  
  return results;
};
