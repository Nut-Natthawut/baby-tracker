export const calculateAge = (birthDateStr: string): string => {
  if (!birthDateStr) return '';
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return '';

  const today = new Date();

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  if (months < 1) {
    if (days < 7) {
      return `${days} วัน`;
    }
    const weeks = Math.floor(days / 7);
    return `${weeks} สัปดาห์`;
  }

  if (months < 12) {
    return `${months} เดือน`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ปี`;
  }

  return `${years} ปี ${remainingMonths} เดือน`;
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม.ที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export const roundToNearest30 = (date: Date): Date => {
  const ms = 1000 * 60 * 30;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};
