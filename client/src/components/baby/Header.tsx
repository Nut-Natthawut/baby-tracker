import React from 'react';
import { Baby } from '@/types/baby';
import { Settings } from 'lucide-react';
import BabySwitcher from './BabySwitcher';

interface HeaderProps {
  baby: Baby | null;
  babies: Baby[];
  onOpenSettings: () => void;
  onSelectBaby: (baby: Baby) => void;
  onAddBaby: () => void;
}

const Header: React.FC<HeaderProps> = ({
  baby,
  babies,
  onOpenSettings,
  onSelectBaby,
  onAddBaby
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-20 shadow-sm">
      <BabySwitcher
        babies={babies}
        currentBaby={baby}
        onSelectBaby={onSelectBaby}
        onAddBaby={onAddBaby}
      />

      <button
        onClick={onOpenSettings}
        className="p-2.5 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-card/80 transition-colors shadow-sm"
      >
        <Settings size={20} className="text-muted-foreground" />
      </button>
    </header>
  );
};

export default Header;
