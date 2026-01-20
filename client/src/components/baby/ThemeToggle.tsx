import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors text-left"
    >
      <div
        className={`p-2 rounded-2xl border border-white/70 dark:border-white/10 ${
          isDark ? 'bg-indigo-100/80 dark:bg-indigo-900/30' : 'bg-amber-100/80 dark:bg-amber-900/20'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={20} className="text-indigo-500" />
          ) : (
            <Sun size={20} className="text-amber-500" />
          )}
        </motion.div>
      </div>
      <div className="flex-1">
        <p className="text-base font-semibold text-foreground">ธีมสี</p>
        <p className="text-sm text-muted-foreground">
          {isDark ? 'โหมดมืด' : 'โหมดสว่าง'}
        </p>
      </div>
      
      {/* Toggle Switch */}
      <div 
        className={`w-14 h-8 rounded-full p-1 transition-colors border border-white/70 dark:border-white/10 ${
          isDark ? 'bg-indigo-500/70' : 'bg-amber-200/80'
        }`}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-md"
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
