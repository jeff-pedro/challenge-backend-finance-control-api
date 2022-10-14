import app from './src/app.js';
import config from './src/config/config.js';

const { port } = config.app;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
