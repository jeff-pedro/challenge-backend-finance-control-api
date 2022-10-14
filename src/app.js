import express from 'express';
import logger from 'morgan';
import db from './config/db.js';
import routes from './routes/index.js';

const app = express();

// database's connection
db.on('error', console.error.bind(console, 'connection error:'));

// use morgan to log at command line
app.use(logger('combined', {
  // don't show the log when it is test
  skip: (req, res) => process.env.NODE_ENV === 'test',
}));

routes(app);

export default app;
