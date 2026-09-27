
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Theme Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Background Color</label>
            <input 
              type="color" 
              value={theme.appBg || '#f9fafb'} 
              onChange={(e) => setTheme({ ...theme, appBg: e.target.value })}
              className="w-full h-10 p-1 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Box/Card Color</label>
            <input 
              type="color" 
              value={theme.cardBg || '#ffffff'} 
              onChange={(e) => setTheme({ ...theme, cardBg: e.target.value })}
              className="w-full h-10 p-1 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Text Color</label>
            <input 
              type="color" 
              value={theme.text || '#111827'} 
              onChange={(e) => setTheme({ ...theme, text: e.target.value })}
              className="w-full h-10 p-1 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Primary/Accent Color</label>
            <input 
              type="color" 
              value={theme.primary || '#2563eb'} 
              onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
              className="w-full h-10 p-1 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={resetTheme}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
          >
            Reset to Default
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
