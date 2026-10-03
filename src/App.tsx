import { useState, useEffect } from 'react';
import { TRANSPORT_UNITS, QRV_UNITS, type Unit } from './distanceConstants';
import { geocode, getMatrix } from './mapboxService';
import ThemeModal, { type ThemeConfig, defaultTheme } from './ThemeModal';
import { 
  Settings, 
  Ambulance, 
  CarFront, 
  Moon, 
  Sun, 
  MapPin, 
  Search, 
  Navigation,
  Compass,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transportResults, setTransportResults] = useState<Unit[]>(TRANSPORT_UNITS);
  const [qrvResults, setQrvResults] = useState<Unit[]>(QRV_UNITS);

  // Theme state: default to Dark mode (standard dispatch ops theme)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('distanceCheckerDarkMode');
    if (saved !== null) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return true; // Default to dark mode
  });
  
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('distanceCheckerTheme');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultTheme;
  });
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply dark mode reliably to <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('distanceCheckerDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save theme config
  useEffect(() => {
    localStorage.setItem('distanceCheckerTheme', JSON.stringify(theme));
  }, [theme]);

  const toggleDarkMode = () => {
    // When toggling light/dark mode, also clear hardcoded custom colors if they conflict
    if (theme.appBg || theme.cardBg) {
      setTheme(defaultTheme);
    }
    setDarkMode(prev => !prev);
  };

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
        setError('An error occurred calculating distances');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (secs?: number) => {
    if (secs === undefined) return '--';
    const m = Math.round(secs / 60);
    return `${m} min`;
  };

  const formatDistance = (miles?: number) => {
    if (miles === undefined) return '-- mi';
    return `${miles.toFixed(1)} mi`;
  };

  // Dynamic overrides only when custom colors are active
  const dynamicAppStyle = theme.appBg ? { backgroundColor: theme.appBg, color: theme.text || undefined } : {};
  const dynamicCardStyle = theme.cardBg ? { backgroundColor: theme.cardBg } : {};
  const dynamicPrimaryColor = theme.primary ? { color: theme.primary } : {};
  const dynamicBtnStyle = theme.primary ? { backgroundColor: theme.primary, borderColor: theme.primary } : {};

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 font-sans ${
        !theme.appBg 
          ? 'bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100' 
          : ''
      }`}
      style={dynamicAppStyle}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10 flex flex-col gap-6 sm:gap-8">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 shrink-0 border border-white/20">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  Distance Checker
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Tactical Ops
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                Real-time EMS unit routing & response ETA calculator
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#111827] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Theme & Display Customizer"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              type="button"
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl border transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2 ${
                darkMode
                  ? 'bg-[#111827] text-amber-300 border-white/10 hover:bg-white/5 hover:border-amber-400/40'
                  : 'bg-white text-indigo-600 border-gray-200 hover:bg-gray-50 hover:border-indigo-400/40'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {darkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        </header>

        {/* Address Input & Search Bar Card */}
        <section 
          className={`p-5 sm:p-7 rounded-2xl border transition-all duration-300 shadow-xl ${
            !theme.cardBg 
              ? 'bg-white/80 dark:bg-[#101726]/80 border-gray-200/80 dark:border-white/10 backdrop-blur-xl' 
              : ''
          }`}
          style={dynamicCardStyle}
        >
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Target Incident Destination</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address, intersection, or landmark (e.g. 800 N Fant St, Anderson SC)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/15 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm font-medium transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && calculateDistances()}
                />
              </div>

              <button 
                type="button"
                onClick={calculateDistances}
                disabled={loading || !address.trim()}
                style={dynamicBtnStyle}
                className={`px-8 py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 ${
                  !theme.primary 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25' 
                    : 'hover:opacity-90'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Routing Units...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Calculate ETAs</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* 2-Column Responsive Unit Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Transport Units Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <Ambulance className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Transport Units ({transportResults.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase">
                Sorted by ETA
              </span>
            </div>

            <div className="space-y-2.5">
              {transportResults.map((unit, idx) => {
                const isFastest = idx === 0 && unit.duration !== undefined;
                return (
                  <div 
                    key={unit.name} 
                    style={dynamicCardStyle}
                    className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                      !theme.cardBg 
                        ? isFastest
                          ? 'bg-gradient-to-r from-rose-500/10 via-white to-white dark:from-rose-500/15 dark:via-[#111827] dark:to-[#111827] border-rose-500/40'
                          : 'bg-white dark:bg-[#101726]/90 border-gray-200/90 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isFastest 
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30' 
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                      }`}>
                        <Ambulance className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                            {unit.name}
                          </h3>
                          {isFastest && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                              Closest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs mt-0.5" title={unit.addr}>
                          {unit.addr}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div 
                        className="text-lg font-black font-mono tracking-tight text-gray-900 dark:text-white"
                        style={dynamicPrimaryColor}
                      >
                        {formatDuration(unit.duration)}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-slate-400">
                        {formatDistance(unit.distance)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QRV Units Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <CarFront className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  QRV / First Response ({qrvResults.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase">
                Sorted by ETA
              </span>
            </div>

            <div className="space-y-2.5">
              {qrvResults.map((unit, idx) => {
                const isFastest = idx === 0 && unit.duration !== undefined;
                return (
                  <div 
                    key={unit.name} 
                    style={dynamicCardStyle}
                    className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                      !theme.cardBg 
                        ? isFastest
                          ? 'bg-gradient-to-r from-blue-500/10 via-white to-white dark:from-blue-500/15 dark:via-[#111827] dark:to-[#111827] border-blue-500/40'
                          : 'bg-white dark:bg-[#101726]/90 border-gray-200/90 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isFastest 
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30' 
                          : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                      }`}>
                        <CarFront className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                            {unit.name}
                          </h3>
                          {isFastest && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                              Closest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs mt-0.5" title={unit.addr}>
                          {unit.addr}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div 
                        className="text-lg font-black font-mono tracking-tight text-gray-900 dark:text-white"
                        style={dynamicPrimaryColor}
                      >
                        {formatDuration(unit.duration)}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-slate-400">
                        {formatDistance(unit.distance)}
                      </div>
                    </div>
                  </div>
                );
              })}
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
