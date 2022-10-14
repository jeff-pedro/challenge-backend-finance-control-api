import mongoose from 'mongoose';
import config from './config.js';

const {
  db: {
    host, name, user, pass,
  },
} = config;

const connectionString = `mongodb+srv://${user}:${pass}@${host}/${name}`;

mongoose.connect(connectionString);

const db = mongoose.connection;

export default db;
