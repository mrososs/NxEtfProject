export interface User {
  securityStamp: string;
  emailConfirmed: boolean;
  normalizedEmail: string;
  twoFactorEnabled: boolean;
  phoneNumberConfirmed: boolean;
  passwordHash: string;
  normalizedUserName: string;
  accessFailedCount: number;
  concurrencyStamp: string;
  userName: string;
  phoneNumber: string;
  lockoutEnd: string;
  id: string;
  email: string;
  lockoutEnabled: boolean;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  launchUrl: string;
  uploadedAt: string;
  reviews: any[];
  trainerName: string | null;
  courseLevel: string | null;
  categories: any[];
  tags: any[];
  faQs: any[];
  courseDetails: any | null;
}

export interface Education {
  id: number;
  institute: string;
  degree: string;
  grade: string;
  specialization: string;
}

export interface Experience {
  id: number;
  employer: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  role: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  proficiency: string;
}

export interface Contact {
  id: number;
  contactDetail: string;
  contactType: string;
}

export interface Profile {
  // Basic profile information
  imageLink: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  description: string;

  // Arrays for profile sections
  courses: Course[];
  educations: Education[];
  experiences: Experience[];
  skills: Skill[];
  contacts: Contact[];

  // Legacy fields for backward compatibility
  id?: string;
  image?: string;
  descriptionAr?: string;
  userId?: string;
  user?: User;
  enrollements?: any[];
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
  message?: string;
}
