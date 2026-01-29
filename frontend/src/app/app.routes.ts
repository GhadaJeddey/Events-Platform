import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
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
import { adminOrOrganizerGuard } from './guards/adminororganizer.guard';
import { adminGuard } from './guards/admin.guard';
import { Profile } from './profile/profile';
import { organizerGuard } from './guards/organizer.guard';
export const routes: Routes = [

    {
        path: 'events',
        children: [
            { path: '', component: EventList },
            { path: 'create', component: CreateEventForm, canActivate: [authGuard, adminOrOrganizerGuard] },
            { path: 'details/:id', component: EventDetails },
            { path: ':id/edit', component: UpdateEvent, canActivate: [authGuard, adminOrOrganizerGuard] }
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
    { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPassword) },


    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard, canActivate: [authGuard, adminGuard] },
            { path: 'approvals', component: EventApproval, canActivate: [authGuard, adminGuard] },
            { path: 'users', component: UserManagement, canActivate: [authGuard, adminGuard] }
        ]
        // TODO: Plus tard, ajouter : canActivate: [AdminGuard]
    },
    {
        path: 'profile',
        children: [
            { path: 'student', component: Profile, canActivate: [authGuard] },
            { path: 'organizer', component: Profile, canActivate: [authGuard, organizerGuard] },
            { path: 'admin', component: Profile, canActivate: [authGuard, adminGuard] }
        ]

    },

    { path: '**', redirectTo: 'events' }
];
