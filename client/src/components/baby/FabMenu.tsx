import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Utensils, Baby, Heart } from 'lucide-react';

interface FabMenuProps {
  onOpenFeeding: () => void;
  onOpenDiaper: () => void;
  onOpenPumping: () => void;
}

const FabMenu: React.FC<FabMenuProps> = ({ onOpenFeeding, onOpenDiaper, onOpenPumping }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: Utensils, 
      label: 'กินนม', 
      color: 'bg-feeding', 
      glow: 'shadow-glow-feeding',
      iconSize: 22,
      onClick: () => { setIsOpen(false); onOpenFeeding(); }
    },
    { 
      icon: Baby, 
      label: 'เปลี่ยนผ้าอ้อม', 
      color: 'bg-diaper', 
      glow: 'shadow-glow-diaper',
      iconSize: 20,
      onClick: () => { setIsOpen(false); onOpenDiaper(); }
    },
    { 
      icon: Heart, 
      label: 'ปั๊มนม', 
      color: 'bg-pump', 
      glow: 'shadow-glow-pump',
      iconSize: 22,
      onClick: () => { setIsOpen(false); onOpenPumping(); }
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
            />

            {/* Menu Items */}
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 0.8,
                    transition: { delay: (menuItems.length - index - 1) * 0.05 }
                  }}
                  onClick={item.onClick}
                  className="flex items-center gap-3"
                >
                  <span className="bg-card px-4 py-2 rounded-full text-sm font-semibold text-foreground border border-border shadow-lg min-w-28 text-center">
                    {item.label}
                  </span>
                  <div className={`w-12 h-12 min-w-12 min-h-12 aspect-square rounded-full ${item.color} flex items-center justify-center shrink-0 ${item.glow}`}>
                    <item.icon size={item.iconSize} className="text-white" />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full 
          bg-primary flex items-center justify-center
          shadow-glow-primary
          transition-transform
        `}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X size={28} className="text-primary-foreground" />
          ) : (
            <Plus size={28} className="text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FabMenu;
