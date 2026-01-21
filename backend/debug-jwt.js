const jwt = require('jsonwebtoken');

const secret = 'hhhgergregregregreg'; // from .env
const payload = { sub: '1', email: 'test@example.com', role: 'Student' };
const options = { expiresIn: '3600s' };

const token = jwt.sign(payload, secret, options);
console.log('Token signed successfully.');

try {
    const decoded = jwt.decode(token, { complete: true });
    console.log('Decoded Header:', decoded.header);
    console.log('Decoded Payload:', decoded.payload);

    const iat = new Date(decoded.payload.iat * 1000);
    const exp = new Date(decoded.payload.exp * 1000);
    const now = new Date();

    console.log('Issued At (iat):', iat.toISOString(), `(${decoded.payload.iat})`);
    console.log('Expires At (exp):', exp.toISOString(), `(${decoded.payload.exp})`);
    console.log('Current Time (now):', now.toISOString(), `(${Math.floor(now.getTime() / 1000)})`);

    console.log('Difference (exp - iat):', (decoded.payload.exp - decoded.payload.iat), 'seconds');
    console.log('Time until expiry:', (decoded.payload.exp - Math.floor(now.getTime() / 1000)), 'seconds');

    const verified = jwt.verify(token, secret);
    console.log('Verification successful!');
} catch (err) {
    console.error('Verification failed:', err.message);
}
