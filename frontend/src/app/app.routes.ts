import { Routes } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { EventDetails } from './events/event-details/event-details';
import { CreateEventForm } from './events/create-event-form/create-event-form';
import { UpdateEvent } from './events/update-event/update-event';
// 👇 His Auth Imports
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { authGuard } from './guards/auth.guard';
// 👇 YOUR Profile Import (Make sure this path is correct!)
import { Profile } from  './profile/profile';

export const routes: Routes = [
    { path: '', redirectTo: 'events', pathMatch: 'full' },

    // 🌍 Public Event Routes
    { path: 'events', component: EventList },
    { path: 'event/details/:id', component: EventDetails },

    // 🔒 Protected Event Routes (Only logged-in users)
    {
        path: 'events/create',
        component: CreateEventForm,
        canActivate: [authGuard]
    },
    {
        path: 'event/update/:id',
        component: UpdateEvent,
        canActivate: [authGuard]
    },

    // 👤 YOUR Profile Route (Protected)
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard] // Only logged in users can see profile
    },

    // 🔑 Auth Routes
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
        ]
    }
];
