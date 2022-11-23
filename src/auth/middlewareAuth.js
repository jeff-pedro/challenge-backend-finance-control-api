import passport from 'passport';
import Users from '../model/User.js';
import tokens from './tokens.js';

export default {
  local: (req, res, next) => {
    passport.authenticate(
      'local',
      { session: false },
      (_, user, err) => {
        if (err && err.message === 'Missing credentials') {
          return res.status(401).json({ error: err.message });
        }

        if (err && err.message === 'Password or username is incorrect') {
          return res.status(401).json({ error: err.message });
        }

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!user) {
          return res.status(401).json();
        }

        req.user = user;
        return next();
      },
    )(req, res, next);
  },
  bearer: (req, res, next) => {
    passport.authenticate(
      'bearer',
      { session: false },
      (err, user, info) => {
        if (err && err.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: err.message });
        }

        if (err && err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'token expired', expiredAt: err.expiredAt });
        }

        // if (err && err.message === ) {
        //   return res.status(500).json({ error: err.message });
        // }

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!user) {
          return res.status(401).json();
        }

        req.token = info.token;
        req.user = user;
        return next();
      },
    )(req, res, next);
  },
  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const id = await tokens.refresh.verify(refreshToken);
      await tokens.refresh.invalidate(refreshToken);
      const user = await Users.findById(id);
      req.user = user;
      return next();
    } catch (err) {
      if (err.message === 'refresh token invalid') {
        return res.status(401).json({ error: err.message });
      }

      if (err.message === 'no refresh token provided') {
        return res.status(401).json({ error: err.message });
      }

      res.status(500).json({ error: err.message });
    }
  },
};
