export interface Instructor {
  name: string;
  avatar: string;
}

export interface Course {
  id: number;
  title: string;
  img: string;
  lectures: number;
  isFeatured?: boolean;
  path: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم' | string; // Union type with string fallback
  rating: number;
  reviews: string; // Formatted as "9k"
  instructor: Instructor;
  buttonText?: string; // Optional (default can be "البدء بالمنهج")

  // Optional fields you might need later:
  price?: string;
  category?: string;
  duration?: string; // e.g., "4 أسابيع"
  startDate?: Date | string;
  progress?: number; // For user progress tracking (0-100)
}
