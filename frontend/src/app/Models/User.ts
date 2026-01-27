export enum UserRole {
  STUDENT = 'student',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}