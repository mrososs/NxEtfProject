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
  reviews?: any[];
  trainerName?: string | null;
  courseLevel?: string;
  categories?: string[];
  tags?: string[];
  faQs?: any[];
  courseDetails?: any;
  lessons?: Lesson[];
}

// Course Details interface matching API courseDetails
export interface CourseDetails {
  id: number;
  intro: string;
  whatYouWillLearn: string;
  whyChoose: string;
  suitableFor: string;
}

// FAQ interface
export interface FAQ {
  id: number;
  question: string;
  questionAr?: string;
  body: string;
  bodyAr?: string;
}

// Lesson interface
export interface Lesson {
  id: number;
  title: string;
  duration: string;
}

// Extended Course interface for UI display matching API response
export interface Course {
  id: number;
  title: string;
  description: string;
  launchUrl: string;
  uploadedAt: string;
  reviews: any[];
  trainerName: string | null;
  courseLevel: string;
  categories: string[];
  tags: string[];
  faQs: FAQ[];
  courseDetails: CourseDetails;
  lessons: Lesson[];

  // Bilingual title fields
  titleAr?: string; // Arabic title
  titleEn?: string; // English title

  // UI fields for display
  img?: string;
  lectures?: number;
  isFeatured?: boolean;
  path?: string;
  level?: string;
  rating?: number;
  instructor?: Instructor;
  buttonText?: string;
  price?: string;
  duration?: string;
  startDate?: Date | string;
  progress?: number;
}
