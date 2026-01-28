import { User } from './User'; 

export interface Organizer {
  id: string;
  name: string;        
  description?: string;
  website?: string;
  isVerified: boolean;
  
  user?: User;          
}