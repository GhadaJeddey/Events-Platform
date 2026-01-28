export enum UserRole {
    STUDENT = 'student',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
    CLUB = 'club',
    USER = 'user'
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    clubName?: string; 
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password?: string; // Optional if using something like social auth, but usually required
}

export interface RegisterRequest {
    role: UserRole;
    user: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: UserRole;
    };
    studentProfile?: {
        major: string;
        studentCardNumber: string;
    };
    organizerProfile?: {
        name: string;
        description?: string;
        website?: string;
    };
}
