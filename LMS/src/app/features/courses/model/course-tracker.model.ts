export interface CourseTracker {
  id: number;
  courseId: number;
  userId: string;
  user: any | null;
  course: any | null;
  data: string;
  isCompleted: boolean;
  lastUpdated: string;
}

export interface CourseLaunchResponse {
  htmlContent: string;
}
