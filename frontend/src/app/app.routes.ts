import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';
import { CreateEventForm } from './events/create-event-form/create-event-form';
import { UpdateEvent } from './events/update-event/update-event';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { authGuard } from './guards/auth.guard';
import { organizerGuard } from './guards/organizer.guard';
import { adminGuard } from './guards/admin.guard';
export const routes: Routes = [
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: 'events', component: EventList },
    {
        path: 'events/create',
        component: CreateEventForm,
        canActivate: [authGuard,organizerGuard]
    },
    { path: 'event/details/:id', component: EventDetails },
    {
        path: 'event/update/:id',
        component: UpdateEvent,
        canActivate: [authGuard,organizerGuard || adminGuard]
    },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
        ]
    }
];