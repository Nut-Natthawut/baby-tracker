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
      className="relative w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
    >
      <div className={`p-2 rounded-xl ${isDark ? 'bg-sleep/20' : 'bg-feeding/20'}`}>
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={20} className="text-sleep" />
          ) : (
            <Sun size={20} className="text-feeding" />
          )}
        </motion.div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">ธีมสี</p>
        <p className="text-xs text-muted-foreground">
          {isDark ? 'โหมดมืด' : 'โหมดสว่าง'}
        </p>
      </div>
      
      {/* Toggle Switch */}
      <div 
        className={`w-12 h-7 rounded-full p-1 transition-colors ${
          isDark ? 'bg-sleep' : 'bg-secondary'
        }`}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-card shadow-md"
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
