import { X, RotateCcw, Check, Sparkles } from 'lucide-react';

export interface ThemeConfig {
  appBg: string;
  cardBg: string;
  text: string;
  primary: string;
}

export const defaultTheme: ThemeConfig = {
  appBg: '',
  cardBg: '',
  text: '',
  primary: ''
};

export const THEME_PRESETS: { name: string; icon: string; config: ThemeConfig }[] = [
  {
    name: 'Tactical Slate',
    icon: '🛡️',
    config: {
      appBg: '#090d16',
      cardBg: '#111827',
      text: '#f8fafc',
      primary: '#3b82f6'
    }
  },
  {
    name: 'Emerald Matrix',
    icon: '⚡',
    config: {
      appBg: '#04130c',
      cardBg: '#062316',
      text: '#ecfdf5',
      primary: '#10b981'
    }
  },
  {
    name: 'OLED Midnight',
    icon: '🌑',
    config: {
      appBg: '#000000',
      cardBg: '#0a0a0a',
      text: '#ffffff',
      primary: '#38bdf8'
    }
  },
  {
    name: 'Cyber Amber',
    icon: '🔥',
    config: {
      appBg: '#120b05',
      cardBg: '#211409',
      text: '#fffbeb',
      primary: '#f59e0b'
    }
  },
  {
    name: 'Clean Light',
    icon: '☀️',
    config: {
      appBg: '#f8fafc',
      cardBg: '#ffffff',
      text: '#0f172a',
      primary: '#2563eb'
    }
  }
];

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  resetTheme: () => void;
}

export default function ThemeModal({ isOpen, onClose, theme, setTheme, resetTheme }: ThemeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-lg relative text-gray-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Theme & Display</h2>
              <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400">Custom styling and palette overrides</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2.5">
            Quick Style Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEME_PRESETS.map((preset) => {
              const isActive = theme.appBg === preset.config.appBg && theme.primary === preset.config.primary;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setTheme(preset.config)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/15 shadow-sm' 
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <span className="text-base">{preset.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold block truncate">{preset.name}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="space-y-3.5 mb-6">
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Custom Color Tuning
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <span className="text-xs font-semibold">Canvas Background</span>
              <input 
                type="color" 
                value={theme.appBg || '#090d16'} 
                onChange={(e) => setTheme({ ...theme, appBg: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <span className="text-xs font-semibold">Card Surface</span>
              <input 
                type="color" 
                value={theme.cardBg || '#111827'} 
                onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <span className="text-xs font-semibold">Primary Text</span>
              <input 
                type="color" 
                value={theme.text || '#f8fafc'} 
                onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
              <span className="text-xs font-semibold">Accent Highlight</span>
              <input 
                type="color" 
                value={theme.primary || '#3b82f6'} 
                onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
          <button 
            type="button"
            onClick={resetTheme}
            className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
