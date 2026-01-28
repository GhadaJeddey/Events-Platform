import { Organizer } from './Organizer';

// Interface qui correspond à l'entité Event du backend
export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
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