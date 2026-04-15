export interface WorkoutCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum PhaseType {
  WARMUP = 'warmup',
  MAIN = 'main',
  COOLDOWN = 'cooldown',
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  videoUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface WorkoutPhase {
  id: string;
  name: string;
  type: PhaseType;
  sortOrder: number;
  duration: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  duration: number;
  caloriesBurned: number;
  phases: WorkoutPhase[];
  category?: WorkoutCategory;
}
