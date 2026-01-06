export interface Baby {
  id: string;
  name: string;
  birthDate: string; // ISO Date string
  gender: 'boy' | 'girl';
  weight?: string; // e.g., "3.2" (kg)
}

export type LogType = 'feeding' | 'diaper' | 'sleep' | 'pump';

export interface LogEntry {
  id: string;
  type: LogType;
  timestamp: Date;
  details: FeedingDetails | DiaperDetails | PumpingDetails | SleepDetails;
}

export interface FeedingDetails {
  method: 'bottle' | 'breast';
  bottleContent?: 'formula' | 'breastmilk';
  amountMl?: number;
  leftDurationSeconds?: number;
  rightDurationSeconds?: number;
  hasSpitUp?: boolean;
  notes?: string;
}

export interface PumpingDetails {
  durationMinutes: number;
  amountLeftMl?: number;
  amountRightMl?: number;
  amountTotalMl: number;
  notes?: string;
}

export interface DiaperDetails {
  status: 'clean' | 'pee' | 'poo' | 'mixed';
  pooColor?: string;
  pooTexture?: string;
  notes?: string;
}

export interface SleepDetails {
  durationMinutes: number;
  endTime?: Date;
  notes?: string;
}

export const POO_COLORS = [
  { id: 'brown', color: '#8B4513', label: 'น้ำตาล' },
  { id: 'yellow', color: '#FFD700', label: 'เหลือง' },
  { id: 'green', color: '#556B2F', label: 'เขียว' },
  { id: 'black', color: '#2F2F2F', label: 'ดำ' },
  { id: 'red', color: '#8B0000', label: 'แดง' },
  { id: 'white', color: '#F0F0F0', label: 'ขาว' },
];

export const POO_TEXTURES = [
  { id: 'runny', label: 'เหลว', desc: 'เป็นน้ำ' },
  { id: 'mushy', label: 'นิ่ม', desc: 'เหมือนข้าวโอ๊ต' },
  { id: 'sticky', label: 'เหนียว', desc: 'หนืด' },
  { id: 'solid', label: 'ก้อน', desc: 'เป็นรูปทรง' },
  { id: 'hard', label: 'แข็ง', desc: 'เป็นก้อนกลม' },
];
