import { useState, useEffect } from 'react';
import { Baby, LogEntry, LogType } from '@/types/baby';
import { generateId } from '@/lib/babyUtils';

const STORAGE_KEYS = {
  BABIES: 'baby-tracker-babies',
  CURRENT_BABY_ID: 'baby-tracker-current-baby-id',
  LOGS: 'baby-tracker-logs',
};

export const useBabyData = () => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBabyId, setCurrentBabyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed current baby
  const baby = babies.find(b => b.id === currentBabyId) || null;

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Migration: check for old single baby format
        const oldBaby = localStorage.getItem('baby-tracker-baby');
        const oldLogs = localStorage.getItem('baby-tracker-logs');
        
        if (oldBaby) {
          // Migrate to new format
          const parsedOldBaby = JSON.parse(oldBaby);
          const babiesArray = [parsedOldBaby];
          setBabies(babiesArray);
          setCurrentBabyId(parsedOldBaby.id);
          localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(babiesArray));
          localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, parsedOldBaby.id);
          localStorage.removeItem('baby-tracker-baby');
        } else {
          // Load new format
          const savedBabies = localStorage.getItem(STORAGE_KEYS.BABIES);
          const savedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_BABY_ID);
          
          if (savedBabies) {
            const parsedBabies = JSON.parse(savedBabies);
            setBabies(parsedBabies);
            
            if (savedCurrentId && parsedBabies.some((b: Baby) => b.id === savedCurrentId)) {
              setCurrentBabyId(savedCurrentId);
            } else if (parsedBabies.length > 0) {
              setCurrentBabyId(parsedBabies[0].id);
            }
          }
        }
        
        // Load logs (same format)
        const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS) || oldLogs;
        if (savedLogs) {
          const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
          setLogs(parsedLogs);
          // Update to new key if migrating
          if (oldLogs && !localStorage.getItem(STORAGE_KEYS.LOGS)) {
            localStorage.setItem(STORAGE_KEYS.LOGS, savedLogs);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save/update baby profile
  const saveBabyProfile = (babyData: Omit<Baby, 'id'>, editingId?: string) => {
    const id = editingId || generateId();
    const newBaby: Baby = {
      ...babyData,
      id,
    };
    
    setBabies(prevBabies => {
      const existingIndex = prevBabies.findIndex(b => b.id === id);
      let updatedBabies: Baby[];
      
      if (existingIndex >= 0) {
        updatedBabies = prevBabies.map(b => b.id === id ? newBaby : b);
      } else {
        updatedBabies = [...prevBabies, newBaby];
      }
      
      localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(updatedBabies));
      return updatedBabies;
    });
    
    // Set as current if it's the first baby or if editing current
    if (!currentBabyId || editingId === currentBabyId || !editingId) {
      setCurrentBabyId(id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, id);
    }
  };

  // Switch to a different baby
  const switchBaby = (babyId: string) => {
    if (babies.some(b => b.id === babyId)) {
      setCurrentBabyId(babyId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, babyId);
    }
  };

  // Delete a baby
  const deleteBaby = (babyId: string) => {
    setBabies(prevBabies => {
      const updatedBabies = prevBabies.filter(b => b.id !== babyId);
      localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(updatedBabies));
      
      // Switch to another baby if current was deleted
      if (currentBabyId === babyId && updatedBabies.length > 0) {
        setCurrentBabyId(updatedBabies[0].id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, updatedBabies[0].id);
      } else if (updatedBabies.length === 0) {
        setCurrentBabyId(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_BABY_ID);
      }
      
      return updatedBabies;
    });
    
    // Also delete logs for this baby (optional: could keep logs)
    setLogs(prevLogs => {
      const updatedLogs = prevLogs.filter(log => (log as any).babyId !== babyId);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // Add a new log entry
  const addLog = (type: LogType, data: { timestamp: Date; details: any }) => {
    if (!currentBabyId) return;
    
    const newEntry: LogEntry & { babyId: string } = {
      id: generateId(),
      babyId: currentBabyId,
      type,
      timestamp: data.timestamp,
      details: data.details,
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [newEntry, ...prevLogs];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // Delete a log entry
  const deleteLog = (logId: string) => {
    setLogs(prevLogs => {
      const updatedLogs = prevLogs.filter(log => log.id !== logId);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // Get logs for current baby only
  const currentBabyLogs = logs.filter(log => 
    (log as any).babyId === currentBabyId || !(log as any).babyId
  );

  // Get logs by type
  const getLogsByType = (type: LogType) => {
    return currentBabyLogs.filter(log => log.type === type);
  };

  // Get recent log by type
  const getRecentLog = (type: LogType) => {
    return currentBabyLogs.find(log => log.type === type);
  };

  // Clear all data
  const clearData = () => {
    localStorage.removeItem(STORAGE_KEYS.BABIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BABY_ID);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    setBabies([]);
    setCurrentBabyId(null);
    setLogs([]);
  };

  return {
    baby,
    babies,
    logs: currentBabyLogs,
    loading,
    saveBabyProfile,
    switchBaby,
    deleteBaby,
    addLog,
    deleteLog,
    getLogsByType,
    getRecentLog,
    clearData,
  };
};
