import { UsersService } from './src/users/users.service';
import { UserEntity } from './src/users/entities/user.entity';

// Mock Repository
const mockRepository: any = {
    create: (dto: any) => dto as UserEntity,
    save: (user: UserEntity) => Promise.resolve({ ...user, id: '1' }),
    findOne: ({ where }: any) => Promise.resolve(where.email === 'test@example.com' ? { id: '1', email: 'test@example.com', password: 'hashed_password', role: 'student' } : null),
};

async function test() {
    const service = new UsersService(mockRepository);

    console.log('Testing create user...');
    const user = await service.create({ email: 'test@example.com', password: 'password', role: 'student' });
    console.log('User created:', user);

    console.log('Testing findByEmail...');
    const foundUser = await service.findByEmail('test@example.com');
    console.log('Found user:', foundUser);

    console.log('Testing findByEmail (not found)...');
    const notFoundUser = await service.findByEmail('other@example.com');
    console.log('Found user (should be undefined):', notFoundUser);
}

test();
