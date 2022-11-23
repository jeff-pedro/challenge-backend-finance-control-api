import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import passport from 'passport';
import Users from '../model/User.js';
import tokens from './tokens.js';

passport.use(
  new LocalStrategy({ session: false }, Users.authenticate()),
);

passport.use(
  new BearerStrategy(
    async (token, done) => {
      try {
        const id = await tokens.access.verify(token);
        const user = await Users.findById(id);
        done(null, user, { token });
      } catch (err) {
        done(err);
      }
    },
  ),
);
