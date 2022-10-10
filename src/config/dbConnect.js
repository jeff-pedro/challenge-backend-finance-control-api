import mongoose from 'mongoose';
import dotenv from 'dotenv/config';

// check the environment stage (test or dev)
if (process.env.NODE_ENV === 'test') {
  mongoose.connect(process.env.TEST_DB_URI);
} else {
  mongoose.connect(process.env.DB_URI);
}

const db = mongoose.connection;

export default db;
