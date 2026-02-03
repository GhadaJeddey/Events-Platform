import { User } from './auth.models';

export interface Organizer {
  id: string;
  name: string;
  description?: string;
  website?: string;
  isVerified: boolean;
eventsCount?: number;
  user?: User;
  createdAt?: Date | string;
}
