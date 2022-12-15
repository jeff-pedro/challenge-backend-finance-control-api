import express from 'express';
import incomes from './incomesRoutes.js';
import expenses from './expensesRoutes.js';
import summary from './summaryRoutes.js';
import users from './usersRoutes.js';
import auth from './authRoutes.js';

const routes = (app) => {
  app.route('/').get((req, res) => {
    res.status(200).send('Welcome to Personal Finance API');
  });

  app.route('/ping').get((req, res) => {
    res.status(200).send('pong!');
  });

  app.use(
    express.json(),
    incomes,
    expenses,
    summary,
    users,
    auth,
  );
};

export default routes;
