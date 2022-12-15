import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
};

const emailConfigTest = (testAccount) => ({
  host: 'smtp.ethereal.email',
  auth: testAccount,
});

async function createEmailConfig() {
  if (process.env.NODE_ENV === 'prod') {
    return emailConfig;
  }
  const testAccount = await nodemailer.createTestAccount();
  return emailConfigTest(testAccount);
}

class Email {
  async sendEmail() {
    const config = await createEmailConfig();
    const transporter = nodemailer.createTransport(config);
    const info = await transporter.sendMail(this);

    if (process.env.NODE_ENV !== 'prod') {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  }
}

export default class CheckEmail extends Email {
  constructor(user, url) {
    super();
    this.from = '"Personal Finance API 👻" <no-reply@example.com>';
    this.to = user.email;
    this.subject = 'Email checking ✔';
    this.text = `Hello! Check your email here: ${url}`;
    this.html = `<h1>Hello!</h1> Check your email here: <a href="${url}">${url}</a>`;
  }
}
