import express from 'express';
import config from './config/config';

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(config.SERVER_PORT, () => {
  console.log(`Server running on port ${config.SERVER_PORT}`);
})
