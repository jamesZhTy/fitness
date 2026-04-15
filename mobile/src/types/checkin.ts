export interface CheckIn {
  id: string;
  userId: string;
  workoutPlanId: string | null;
  date: string;
  duration: number;
  caloriesBurned: number;
  mood: string | null;
  note: string | null;
  photos: string[];
  createdAt: string;
}

export interface CheckInStats {
  totalCheckIns: number;
  totalDuration: number;
  totalCalories: number;
  streak: number;
}

export interface Reminder {
  id: string;
  userId: string;
  time: string;
  repeatDays: string[];
  isEnabled: boolean;
  message: string;
  createdAt: string;
}
