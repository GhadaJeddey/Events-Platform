import { Event } from './Event';

export enum RegistrationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    WAITLIST = 'WAITLIST',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

export interface Registration {
    id: string;
    status: RegistrationStatus;
    createdAt: string;
    event: Event; 
}