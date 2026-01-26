import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../Commun/environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User, UserRole } from '../Models/auth.models';
import { jwtDecode } from 'jwt-decode';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;
    private logouttimer:any;

    // State management using Signals
    private _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = computed(() => {
        const user = this._currentUser();
        return !!user && !this.isTokenExpired();
    });
    readonly isAdmin = computed(() => this._currentUser()?.role === UserRole.ADMIN);
    readonly isOrganizer = computed(() => this._currentUser()?.role === UserRole.ORGANIZER);

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
        if (this.logouttimer)
        {
            clearTimeout(this.logouttimer);
        }
    }

    /**
     * Private helper to set session data
     */
    private setSession(token: string, user: User): void {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
        const decodedToken :any=jwtDecode(token);
        this.autoLogout(decodedToken.exp*1000);
    }

    /**
     * Check if user is logged in on app startup
     */
    private checkAuth(): void {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr && !this.isTokenExpired()) {
            try {
                const user = JSON.parse(userStr);
                this._currentUser.set(user);
                const decodedToken :any=jwtDecode(token);
                this.autoLogout(decodedToken.exp*1000);
            } catch (e) {
                this.logout();
            }
        }
        else {
            this.logout();
        }
    }

    /**
     * Get the stored token
     */
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch {
        return true; 
    }

}
    private autoLogout(ExpirationDate:number) : void{
        const now=Date.now();
        const delay=ExpirationDate-now;
        if (this.logouttimer)
        {
            clearTimeout(this.logouttimer);
        }
        if (delay>0) {
            this.logouttimer=setTimeout(()=>{
                this.logout();
            },delay);
        } 
        else {
            this.logout();
        }


    }
}


