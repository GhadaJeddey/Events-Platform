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
import { adminOrOrganizerGuard } from './guards/adminororganizer.guard';
import { adminGuard } from './guards/admin.guard';

import { Dashboard } from './admin/dashboard/dashboard';
import { EventApproval } from './admin/event-approval/event-approval';
import { UserManagement } from './admin/user-management/user-management';
import { StudentDashboard } from './student/dashboard/dashboard';
import { OrganizerDashboard } from './organizer/dashboard/dashboard';
import { EventStatisticsComponent } from './organizer/event-statistics/event-statistics';
import { OrganizersList } from './organizer/organizers-list/organizers-list';
import { OrganizerDetails } from './organizer/organizer-details/organizer-details';
import { AllMyEvents } from './organizer/all-my-events/all-my-events';

export const routes: Routes = [

    {
        path: 'events',
        children: [
            { path: '', component: EventList },
            { path: 'create', component: CreateEventForm, canActivate: [authGuard,adminOrOrganizerGuard] },
            { path: ':id', component: EventDetails },
            { path: ':id/edit', component: UpdateEvent, canActivate: [authGuard,adminOrOrganizerGuard] }
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
        path: 'organisations',
        children: [
            { path: '', component: OrganizersList },
            { path: ':id', component: OrganizerDetails }
        ]
    },

    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            { path: 'dashboard', component: Dashboard,canActivate:[authGuard,adminGuard] },
            { path: 'approvals', component: EventApproval,canActivate:[authGuard,adminGuard] },
            { path: 'users', component: UserManagement,canActivate:[authGuard,adminGuard] }
        ]
        // TODO: Plus tard, ajouter : canActivate: [AdminGuard]
    }, 

    {
        path: 'student',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: StudentDashboard, canActivate: [authGuard] }
        ]
    },

    {
        path: 'organizer',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: OrganizerDashboard, canActivate: [authGuard] },
            { path: 'dashboard/tous', component: AllMyEvents, canActivate: [authGuard] },
            { path: 'events/:id/statistics', component: EventStatisticsComponent, canActivate: [authGuard] }
        ]
    },
    
    { path: '**', redirectTo: 'events' }
];