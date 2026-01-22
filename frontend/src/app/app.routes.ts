import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';
import { CreateEventForm } from './events/create-event-form/create-event-form';
import { UpdateEvent } from './events/update-event/update-event';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { EventApprovalComponent } from './admin/event-approval/event-approval';
import { UserManagementComponent } from './admin/user-management/user-management';

export const routes: Routes = [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', component: EventList },
    { path: 'events/create', component: CreateEventForm },
    { path: 'event/details/:id', component: EventDetails },
    { path: 'event/update/:id', component: UpdateEvent },
    { 
        path: 'admin',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'approvals', component: EventApprovalComponent },
            { path: 'users', component: UserManagementComponent }
        ]
        // TODO: Plus tard, ajouter : canActivate: [AdminGuard]
    }
];