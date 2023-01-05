import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.testing' : '.env',
});

const config = {
  app: {
    port: parseInt(process.env.PORT) || 3000,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 27017,
    name: process.env.DB_NAME || 'personal-finance-test',
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
};

export default config;
