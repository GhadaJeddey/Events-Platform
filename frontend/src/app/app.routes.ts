import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { EventList } from './features/events/event-list/event-list';
import { EventDetails } from './features/events/event-details/event-details';
import { CreateEventForm } from './features/events/create-event-form/create-event-form';
import { UpdateEvent } from './features/events/update-event/update-event';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { authGuard } from './guards/auth.guard';
import { adminOrOrganizerGuard } from './guards/adminororganizer.guard';
import { adminGuard } from './guards/admin.guard';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { EventApproval } from './features/admin/event-approval/event-approval';
import { UserManagement } from './features/admin/user-management/user-management';
import { OrganizerApproval } from './features/admin/organizer-approval/organizer-approval';
import { RoomApproval } from './features/admin/room-approval/room-approval';
import { Student } from './features/student/student';
import { StudentDashboard } from './features/student/dashboard/dashboard';
import { OrganizerDashboard } from './features/organizer/dashboard/dashboard';
import { EventStatisticsComponent } from './features/organizer/event-statistics/event-statistics';
import { OrganizersList } from './features/organizer/organizers-list/organizers-list';
import { OrganizerDetails } from './features/organizer/organizer-details/organizer-details';
import { AllMyEvents } from './features/organizer/all-my-events/all-my-events';
import { Profile } from './features/profile/profile';
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
        path: 'organisations',
        children: [
            { path: '', component: OrganizersList },
            { path: ':id', component: OrganizerDetails }
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
    { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword) },
    {
        path: 'admin',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            { path: 'profile', component: Profile, canActivate:[authGuard] },
            { path: 'dashboard', component: Dashboard,canActivate:[authGuard,adminGuard] },
            { path: 'approvals', component: EventApproval,canActivate:[authGuard,adminGuard] },
            { path: 'organizers-approvals', component: OrganizerApproval, canActivate:[authGuard,adminGuard] },
            { path: 'rooms-approvals', component: RoomApproval, canActivate:[authGuard,adminGuard] },
            { path: 'users', component: UserManagement,canActivate:[authGuard,adminGuard] }
        ]
    },
    {
        path: 'student',
        component: Student,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: StudentDashboard },
            { path: 'profile', component: Profile }
        ]
    },
    {
        path: 'organizer',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {path: 'profile', component: Profile, canActivate: [authGuard] },
            { path: 'dashboard', component: OrganizerDashboard, canActivate: [authGuard] },
            { path: 'dashboard/tous', component: AllMyEvents, canActivate: [authGuard] },
            { path: 'events/:id/statistics', component: EventStatisticsComponent, canActivate: [authGuard] },
            { path: 'events/create', component: CreateEventForm, canActivate: [authGuard,adminOrOrganizerGuard] },
            { path: 'events/:id/edit', component: UpdateEvent, canActivate: [authGuard,adminOrOrganizerGuard] }
        ]
    },
    {path: '**', redirectTo: 'events' }
];
