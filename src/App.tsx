import { useState, useEffect } from 'react';
import { TRANSPORT_UNITS, QRV_UNITS, type Unit } from './distanceConstants';
import { geocode, getMatrix } from './mapboxService';
import ThemeModal, { type ThemeConfig, defaultTheme } from './ThemeModal';
import { Settings, Ambulance, CarFront, Moon, Sun } from 'lucide-react';

export default function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transportResults, setTransportResults] = useState<Unit[]>(TRANSPORT_UNITS);
  const [qrvResults, setQrvResults] = useState<Unit[]>(QRV_UNITS);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('distanceCheckerDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('distanceCheckerTheme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('distanceCheckerDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save theme config
  useEffect(() => {
    localStorage.setItem('distanceCheckerTheme', JSON.stringify(theme));
  }, [theme]);

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

  // Dynamic styles based on theme config
  const appStyle = theme.appBg ? { backgroundColor: theme.appBg, color: theme.text } : (theme.text ? { color: theme.text } : {});
  const cardStyle = theme.cardBg ? { backgroundColor: theme.cardBg } : {};
  const textStyle = theme.text ? { color: theme.text } : {};
  const primaryStyle = theme.primary ? { color: theme.primary } : {};
  const btnStyle = theme.primary ? { backgroundColor: theme.primary, borderColor: theme.primary } : {};

  return (
    <div className="min-h-screen transition-colors duration-200" style={appStyle}>
      <div className={`min-h-screen ${!theme.appBg ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100' : ''}`}>
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold" style={textStyle}>Distance Checker</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsThemeModalOpen(true)}
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                title="Theme Settings"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          <div 
            className={`p-6 rounded-lg shadow-md mb-8 ${!theme.cardBg ? 'bg-white dark:bg-gray-800' : ''}`}
            style={cardStyle}
          >
            <div className="flex gap-4 flex-col sm:flex-row">
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
                style={btnStyle}
                className={`px-6 py-2 text-white rounded-md transition disabled:opacity-50 ${!theme.primary ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-90'}`}
              >
                {loading ? 'Calculating...' : 'Check Distances'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Transport Units */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700" style={textStyle}>
                Transport Units
              </h2>
              <div className="space-y-3">
                {transportResults.map((unit, idx) => (
                  <div 
                    key={idx} 
                    style={cardStyle}
                    className={`p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center ${!theme.cardBg ? 'bg-white dark:bg-gray-800' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full shrink-0">
                        <Ambulance size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={textStyle}>{unit.name}</h3>
                        <p className="text-sm opacity-70" style={textStyle}>{unit.addr}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={theme.primary ? primaryStyle : { color: 'var(--color-primary)' }}>{formatDuration(unit.duration)}</p>
                      <p className="text-sm opacity-70" style={textStyle}>{formatDistance(unit.distance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QRV Units */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700" style={textStyle}>
                QRV Units
              </h2>
              <div className="space-y-3">
                {qrvResults.map((unit, idx) => (
                  <div 
                    key={idx} 
                    style={cardStyle}
                    className={`p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center ${!theme.cardBg ? 'bg-white dark:bg-gray-800' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                        <CarFront size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={textStyle}>{unit.name}</h3>
                        <p className="text-sm opacity-70" style={textStyle}>{unit.addr}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={theme.primary ? primaryStyle : { color: 'var(--color-primary)' }}>{formatDuration(unit.duration)}</p>
                      <p className="text-sm opacity-70" style={textStyle}>{formatDistance(unit.distance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ThemeModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)}
        theme={theme}
        setTheme={setTheme}
        resetTheme={() => setTheme(defaultTheme)}
      />
    </div>
  );
}
