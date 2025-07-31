export interface User {
  username: string;
  email: string;
  userId: string;
}

export interface Profile {
  id: number;
  image: string;
  imageLink: string;
  firstName: string;
  middleName: string;
  lastName: string;
  description: string;
  user: User;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
  message?: string;
}
