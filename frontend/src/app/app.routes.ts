import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';

export const routes: Routes = [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', component: EventList },
    { path: 'event/details/:id', component: EventDetails },
];