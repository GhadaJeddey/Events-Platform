const { UsersService } = require('./dist/users/users.service');
const { Test } = require('@nestjs/testing');

async function test() {
    const service = new UsersService();

    console.log('Testing create user...');
    const user = await service.create({ email: 'test@example.com', password: 'password' });
    console.log('User created:', user);

    console.log('Testing findByEmail...');
    const foundUser = await service.findByEmail('test@example.com');
    console.log('Found user:', foundUser);

    console.log('Testing findByEmail (not found)...');
    const notFoundUser = await service.findByEmail('other@example.com');
    console.log('Found user (should be undefined):', notFoundUser);
}

test();
