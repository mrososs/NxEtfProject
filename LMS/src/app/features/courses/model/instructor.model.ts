// API Instructor interface matching the API response
export interface ApiInstructor {
  id: number;
  name: string;
  title: string;
  mainSkill: string;
  numberOfCourses: number;
  numberOfStudents: number;
  starRanking?: number; // Made optional to handle missing property
  about: string;
  channels: {
    [key: string]: string[];
  };
}

// API Response wrapper for paginated instructor list
export interface ApiInstructorResponse {
  data: ApiInstructor[];
  count: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Extended Instructor interface for UI display
export interface Instructor {
  id: number;
  name: string;
  title: string;
  mainSkill: string;
  numberOfCourses: number;
  numberOfStudents: number;
  starRanking: number;
  about: string;
  channels: {
    [key: string]: string[];
  };
  // UI-specific fields
  avatar?: string;
  isFeatured?: boolean;

  // Backward compatibility with old local data structure
  img?: string;
  technicalSkill?: string;
  course?: string;
  rating?: number;
  review?: string;
  students?: number;
  description?: string;
  contact?: {
    linkedIn: string;
    gmail: string;
    phone: string;
  };
}

// Query parameters for instructor API
export interface InstructorQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?:
    | 'Id'
    | 'Name'
    | 'Title'
    | 'MainSkill'
    | 'NumberOfCourses'
    | 'NumberOfStudents'
    | 'StarRanking';
  sortDir?: 'asc' | 'desc';
  search?: string;
  mainSkill?: string;
}
