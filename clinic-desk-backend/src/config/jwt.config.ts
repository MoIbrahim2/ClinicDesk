import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  expiration: process.env.JWT_EXPIRATION || '900s',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '604800s',
}));
