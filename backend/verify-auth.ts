import { UsersService } from './src/users/users.service';
import { AuthService } from './src/auth/auth.service';
import { UserEntity } from './src/users/entities/user.entity';

// Stateful Mock Repository
const mockRepository = {
    users: [] as UserEntity[],
    create: (dto: any) => dto as UserEntity,
    save: async (user: UserEntity) => {
        const newUser = { ...user, id: Math.floor(Math.random() * 100000) };
        mockRepository.users.push(newUser);
        return newUser;
    },
    findOne: async ({ where }: any) => {
        return mockRepository.users.find(u => u.email === where.email) || null;
    }
};

const mockJwtService = {
    sign: () => 'mock-jwt-token',
};

async function test() {
    const usersService = new UsersService(mockRepository as any);
    const authService = new AuthService(usersService, mockJwtService as any);

    console.log('Testing register...');
    const user = await authService.register({ email: 'test@example.com', password: 'password123', role: 'user' });
    console.log('User registered:', user);
    console.log('Password hashed check:', user.password !== 'password123');

    console.log('Testing login (correct password)...');
    try {
        const loginResult = await authService.authenticate({ email: 'test@example.com', password: 'password123' });
        console.log('Login successful:', loginResult);
    } catch (e) {
        console.error('Login failed:', e.message);
    }

    console.log('Testing login (incorrect password)...');
    try {
        await authService.authenticate({ email: 'test@example.com', password: 'wrongpassword' });
        console.log('Login successful (unexpected)');
    } catch (e) {
        console.log('Login failed (expected):', e.message);
    }
}

test();
