import { useState, useEffect } from 'react';
import { Baby, LogEntry, LogType } from '@/types/baby';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEYS = {
  BABIES: 'baby-tracker-babies',
  CURRENT_BABY_ID: 'baby-tracker-current-baby-id',
  LOGS: 'baby-tracker-logs',
};

export const useBabyData = () => {
  const { token, logout } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBabyId, setCurrentBabyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed current baby
  const baby = babies.find(b => b.id === currentBabyId) || null;

  // Load data
  useEffect(() => {
    if (!token) {
      setBabies([]);
      setLogs([]);
      setCurrentBabyId(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/babies`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          await logout();
          return;
        }

        const result = await response.json();

        if (result.success) {
          const mappedBabies = result.data.map((b: any) => ({
            ...b,
            birthDate: b.birth_date || b.birthDate,
          }));
          setBabies(mappedBabies);

          const savedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_BABY_ID);

          if (savedCurrentId && result.data.some((b: Baby) => b.id === savedCurrentId)) {
            setCurrentBabyId(savedCurrentId);
          } else if (result.data.length > 0) {
            setCurrentBabyId(result.data[0].id);
          } else {
            setCurrentBabyId(null);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, logout]);

  // NOTE: In a real app, we might want to separate log fetching into a separate useEffect dependent on currentBabyId
  // But for now, we'll keep it simple or refactor slightly.


  // NOTE: In a real app, we might want to separate log fetching into a separate useEffect dependent on currentBabyId
  // But for now, we'll keep it simple or refactor slightly.

  // Refactored Effect to handle baby switching
  useEffect(() => {
    if (!currentBabyId || !token) return;

    const fetchLogs = async () => {
      try {
        console.log("DEBUG: Fetching logs for babyId:", currentBabyId);
        const response = await fetch(`${API_BASE_URL}/logs/${currentBabyId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          await logout();
          return;
        }
        const result = await response.json();
        console.log("DEBUG: API Response:", result);
        if (result.success) {
          const parsedLogs = result.data.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp * 1000),
          }));
          console.log("DEBUG: Parsed Logs count:", parsedLogs.length);
          setLogs(parsedLogs);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, [currentBabyId, token, logout]);


  // Save baby profile
  const saveBabyProfile = async (babyData: Partial<Baby>) => {
    if (!token) return false;
    try {
      const isEdit = !!babyData.id;
      const url = isEdit
        ? `${API_BASE_URL}/babies/${babyData.id}`
        : `${API_BASE_URL}/babies`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(babyData),
      });

      if (response.status === 401) {
        await logout();
        return false;
      }
      const result = await response.json();

      if (result.success) {
        setBabies(prev => {
          if (isEdit) {
            return prev.map(b => b.id === babyData.id ? result.data : b);
          }
          return [...prev, result.data];
        });

        // If this is the first baby, select it
        if (!currentBabyId || (isEdit && currentBabyId === babyData.id)) {
          setCurrentBabyId(result.data.id);
          localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, result.data.id);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving baby profile:", error);
      return false;
    }
  };

  // Switch to a different baby
  const switchBaby = (babyId: string) => {
    if (babies.some(b => b.id === babyId)) {
      setCurrentBabyId(babyId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, babyId);
    }
  };

  // Delete a baby via API
  const deleteBaby = async (babyId: string) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/babies/${babyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        await logout();
        return false;
      }
      const result = await response.json();

      if (result.success) {
        setBabies(prev => {
          const updated = prev.filter(b => b.id !== babyId);
          if (currentBabyId === babyId) {
            const nextId = updated.length > 0 ? updated[0].id : null;
            setCurrentBabyId(nextId);
            if (nextId) localStorage.setItem(STORAGE_KEYS.CURRENT_BABY_ID, nextId);
            else localStorage.removeItem(STORAGE_KEYS.CURRENT_BABY_ID);
          }
          return updated;
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting baby:', error);
    }
    return false;
  };

  // Add a new log entry via API
  const addLog = async (type: LogType, data: { timestamp: Date; details: any }) => {
    if (!currentBabyId || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          babyId: currentBabyId,
          type,
          timestamp: Math.floor(data.timestamp.getTime() / 1000), // Send as Unix timestamp
          details: data.details
        }),
      });

      if (response.status === 401) {
        await logout();
        return;
      }
      const result = await response.json();

      if (result.success) {
        const newEntry = {
          ...result.data,
          timestamp: new Date(result.data.timestamp * 1000), // Convert back for state
          details: data.details // Optimistic or use response
        };

        setLogs(prevLogs => [newEntry, ...prevLogs]);
      }
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };

  // Delete a log entry via API
  const deleteLog = async (logId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/logs/${logId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        await logout();
        return;
      }
      const result = await response.json();

      if (result.success) {
        setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
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
