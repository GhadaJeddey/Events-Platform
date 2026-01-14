import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';
import { CreateEventForm } from './events/create-event-form/create-event-form';

export const routes: Routes = [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', component: EventList },
    { path: 'events/create', component: CreateEventForm },
    { path: 'event/details/:id', component: EventDetails },
];