require('dotenv').config();

import { Dialect } from 'sequelize';

export default {
  SERVER_PORT: process.env.SERVER_PORT || 3030,
  DATABASE_NAME: process.env.DATABASE_NAME || 'database',
  DATABASE_USER: process.env.DATABASE_USER || 'user',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'password',
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT) || 5432,
  DATABASE_DIALECT: (process.env.DATABASE_DIALECT || 'postgres') as Dialect,
}
