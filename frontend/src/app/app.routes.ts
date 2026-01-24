import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';
import { CreateEventForm } from './events/create-event-form/create-event-form';
import { UpdateEvent } from './events/update-event/update-event';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { authGuard } from './guards/auth.guard';

import { Dashboard } from './admin/dashboard/dashboard';
import { EventApproval } from './admin/event-approval/event-approval';
import { UserManagement } from './admin/user-management/user-management';

export const routes: Routes = [

    {
        path: 'events',
        children: [
            { path: '', component: EventList },
            { path: 'create', component: CreateEventForm, canActivate: [authGuard] },
            { path: ':id', component: EventDetails },
            { path: ':id/edit', component: UpdateEvent, canActivate: [authGuard] }
        ]
    },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
        ]
    },

    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'approvals', component: EventApproval },
            { path: 'users', component: UserManagement }
        ]
        // TODO: Plus tard, ajouter : canActivate: [AdminGuard]
    }, 
    
    {path: '**', redirectTo: 'events' }
];