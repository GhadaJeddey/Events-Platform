import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../Commun/environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User, UserRole } from '../Models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    // State management using Signals
    private _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = computed(() => !!this._currentUser());
    readonly isAdmin = computed(() => this._currentUser()?.role === UserRole.ADMIN);

    constructor() {
        this.checkAuth();
    }

    /**
     * Register a new user
     */
    register(request: RegisterRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, request);
    }

    /**
     * Login user and store token
     */
    login(request: LoginRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, request).pipe(
            tap((response: { input: User, accesstoken: string }) => {
                // Backend returns { input: User, accesstoken: string }
                const user = response.input;
                const token = response.accesstoken;

                if (token) {
                    this.setSession(token, user);
                }
            })
        );
    }

    /**
     * Logout user and clear session
     */
    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this._currentUser.set(null);
    }

    /**
     * Private helper to set session data
     */
    private setSession(token: string, user: User): void {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
    }

    /**
     * Check if user is logged in on app startup
     */
    private checkAuth(): void {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                this._currentUser.set(user);
            } catch (e) {
                this.logout();
            }
        }
    }

    /**
     * Get the stored token
     */
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}
