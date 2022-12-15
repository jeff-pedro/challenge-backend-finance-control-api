import Users from '../model/User.js';
import tokens from '../auth/tokens.js';
import CheckEmail from '../auth/emails.js';

function generateURL(route, id) {
  const urlBase = process.env.URL_BASE;
  return `${urlBase}${route}${id}`;
}

export default class UserController {
  static register(req, res) {
    const {
      username,
      email,
      password,
    } = req.body;

    Users.register(
      new Users({ username, email }),
      password,
      (err, user) => {
        if (err) {
          return res.status(422).json({ error: err.message });
        }

        // email checking
        const token = tokens.emailChecking.create(user._id);
        const emailCheckingURL = generateURL('/check_email/', token);
        const emailChecking = new CheckEmail(user, emailCheckingURL);
        emailChecking.sendEmail().catch(console.log);
        res.status(201).json({ message: `${username} registered` });
      },
    );
  }

  static async login(req, res) {
    try {
      const accessToken = tokens.access.create(req.user.id);
      const refreshToken = await tokens.refresh.create(req.user.id);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async logout(req, res) {
    try {
      const { token } = req;
      await tokens.access.invalidate(token);
      res.status(200).json();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static checkEmail(req, res) {
    const { id } = req.user;
    const update = { emailChecked: true };
    Users.findByIdAndUpdate(id, update, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      res.status(200).json();
    });
  }
}
