import { UsersService } from './src/users/services/users.service';
import { AuthService } from './src/auth/auth.service';
import { User } from './src/users/entities/user.entity';
import { UserRole } from './src/common/enums/user.enums';

// Stateful Mock Repository
const mockRepository = {
    users: [] as User[],
    create: (dto: any) => dto as User,
    save: async (user: User) => {
        const newUser = {
            ...user,
            id: Math.random().toString(36).substring(2, 15), // Generate string ID
        };
        mockRepository.users.push(newUser);
        return newUser;
    },
    findOne: async ({ where }: any) => {
        return mockRepository.users.find((u) => u.email === where.email) || null;
    },
    findOneBy: async ({ id }: any) => {
        return mockRepository.users.find((u) => u.id === id) || null;
    },
};

const mockJwtService = {
    sign: () => 'mock-jwt-token',
};
const mockStudentsService = {} as any;
const mockOrganizersService = {} as any;

async function test() {
    const usersService = new UsersService(mockRepository as any);
    const authService = new AuthService(
        usersService,
        mockJwtService as any,
        mockStudentsService,   
        mockOrganizersService  
    );
    console.log('Testing register...');
    try {
        const user = await authService.register({
            role: UserRole.STUDENT,
            user: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123',
                role: UserRole.STUDENT,
            },
            studentProfile: {
                major: 'RT',
                studentCardNumber: '12345678'
            }
        });
        console.log('User registered:', { ...user, password: '[HASHED]' });
        console.log('Password hashed check:', user.password !== 'password123');
    } catch (e) {
        console.error('Registration failed:', e.message);
    }

    console.log('\nTesting login (correct password)...');
    try {
        const loginResult = await authService.authenticate({
            email: 'test@example.com',
            password: 'password123',
        });
        console.log('Login successful:', {
            ...loginResult,
            input: { ...loginResult.input, password: '[REDACTED]' },
        });
    } catch (e) {
        console.error('Login failed:', e.name, e.message);
    }

    console.log('\nTesting login (incorrect password)...');
    try {
        await authService.authenticate({
            email: 'test@example.com',
            password: 'wrongpassword',
        });
        console.log('Login successful (unexpected)');
    } catch (e) {
        console.log('Login failed (expected):', e.name, e.message);
    }
}

test();

