export enum UserRole {
    STUDENT = 'student',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
    USER = 'user'
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    organizerProfile?: {
        id: string;
        name: string;
        description?: string;
        website?: string;
        isVerified: boolean;
    };
    studentProfile?: any; 
    clubName?: string; 
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
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
