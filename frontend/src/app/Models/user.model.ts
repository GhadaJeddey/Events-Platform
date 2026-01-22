export enum UserRole {
  STUDENT = 'Student',
  ORGANIZER = 'Organizer',
  ADMIN = 'Admin',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

}
