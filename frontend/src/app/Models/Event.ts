import { Organizer } from './organizer';
export enum RoomLocation {
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
  A7 = 'A7',
  A8 = 'A8',
  A9 = 'A9',
  SAMSUNG = 'Salle Samsung',
  ORANGE = 'Salle Orange',
  AUDITORIUM = 'Auditorium',
}


export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: RoomLocation;
    capacity: number;
    currentRegistrations: number;
    imageUrl?: string;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
    eventStatus: 'upcoming' | 'ongoing' | 'completed';
    clubId?: string;
    organizerId?: string;
    organizer?: Organizer;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

