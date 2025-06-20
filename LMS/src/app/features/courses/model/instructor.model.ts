export interface Instructor {
  id: number;
  img: string;
  name: string;
  technicalSkill: string;
  course: string;
  rating: number;
  review: string;
  students: number;
  description:string;
  contact:contact;
}
export interface contact{
  linkedIn:string;
  gmail:string;
  phone:string;
}
