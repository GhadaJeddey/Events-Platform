import { User } from '../Models/auth.models';

export interface Organizer {
  id: string;
  name: string;
  description?: string;
  website?: string;
  isVerified: boolean;
eventsCount?: number;
  user?: User;
}
