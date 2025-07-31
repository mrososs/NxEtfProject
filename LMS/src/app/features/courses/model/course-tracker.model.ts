export interface CourseTrackerRequest {
  element: string;
  courseId: number;
  value: string;
}

export interface CourseTrackerResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ScormElement {
  id: string;
  name: string;
  type:
    | 'lesson_location'
    | 'lesson_status'
    | 'score'
    | 'total_time'
    | 'suspend_data'
    | 'custom';
  value: string;
  timestamp: Date;
}

export interface CourseProgress {
  courseId: number;
  userId: number;
  elements: ScormElement[];
  lastUpdated: Date;
  completionPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
}
