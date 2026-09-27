import { useState, useEffect } from 'react';
import { TRANSPORT_UNITS, QRV_UNITS, type Unit } from './distanceConstants';
import { geocode, getMatrix } from './mapboxService';

export default function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transportResults, setTransportResults] = useState<Unit[]>(TRANSPORT_UNITS);
  const [qrvResults, setQrvResults] = useState<Unit[]>(QRV_UNITS);

  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const calculateDistances = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const destCoord = await geocode(address);
      
      const geocodeWithCache = async (addr: string): Promise<[number, number]> => {
        return await geocode(addr);
      };

      const tCoords = await Promise.all(TRANSPORT_UNITS.map(u => geocodeWithCache(u.addr)));
      const tMatrix = await getMatrix(destCoord, tCoords);
      
      const newTransport = TRANSPORT_UNITS.map((u, i) => ({
        ...u,
        distance: tMatrix.distances[i],
        duration: tMatrix.durations[i]
      })).sort((a, b) => (a.duration || 0) - (b.duration || 0));
      
      setTransportResults(newTransport);

      const qCoords = await Promise.all(QRV_UNITS.map(u => geocodeWithCache(u.addr)));
      const qMatrix = await getMatrix(destCoord, qCoords);
      
      const newQrv = QRV_UNITS.map((u, i) => ({
        ...u,
        distance: qMatrix.distances[i],
        duration: qMatrix.durations[i]
      })).sort((a, b) => (a.duration || 0) - (b.duration || 0));
      
      setQrvResults(newQrv);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (secs?: number) => {
    if (secs === undefined) return 'N/A';
    const m = Math.round(secs / 60);
    return `${m} min`;
  };

  const formatDistance = (miles?: number) => {
    if (miles === undefined) return 'N/A';
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Distance Checker</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-4">
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter destination address..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && calculateDistances()}
            />
            <button 
              onClick={calculateDistances}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Calculating...' : 'Check Distances'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Transport Units */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Transport Units</h2>
            <div className="space-y-3">
              {transportResults.map((unit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{unit.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{unit.addr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(unit.duration)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDistance(unit.distance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QRV Units */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">QRV Units</h2>
            <div className="space-y-3">
              {qrvResults.map((unit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{unit.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{unit.addr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(unit.duration)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDistance(unit.distance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
