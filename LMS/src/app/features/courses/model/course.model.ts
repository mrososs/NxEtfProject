export interface Instructor {
  name: string;
  avatar: string;
}

// Course filter interface for advanced filtering
export interface CourseFilter {
  search?: string; // Text search for title, description, etc.
  category?: string[]; // Array of category values
  level?: string[]; // Array of level values (beginner, mid, advanced)
  instructor?: string[]; // Array of instructor IDs or names
  price?: {
    min?: number;
    max?: number;
  };
  rating?: number; // Minimum rating filter
  duration?: {
    min?: number; // in hours
    max?: number;
  };
  language?: string; // Course language
  isFree?: boolean; // Free courses only
  isFeatured?: boolean; // Featured courses only
}

// API Course interface matching the API response
export interface ApiCourse {
  id: number;
  title: string;
  description: string;
  launchUrl: string;
  uploadedAt: string;
}

// Extended Course interface for UI display
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

  // API fields
  description?: string;
  launchUrl?: string;
  uploadedAt?: string;
}
