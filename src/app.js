import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import db from './config/db.js';
import routes from './routes/index.js';

// passport strategies to authenticate
import './auth/strategies.js';

const app = express();

// database's connection
db.on('error', console.error.bind(console, 'connection error:'));

// use morgan to log requests
app.use(logger('combined', {
  // don't show the log when it is test
  skip: (req, res) => process.env.NODE_ENV === 'test',
}));

// use body-parser to transform json to object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

routes(app);

export default app;
