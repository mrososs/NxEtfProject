export interface User {
  username: string;
  email: string;
  userId: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  launchUrl: string;
  uploadedAt: string;
  reviews: any[];
}

export interface Profile {
  imageLink: string;
  firstName: string;
  middleName: string;
  lastName: string;
  description: string;
  courses: Course[];
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
  message?: string;
}
