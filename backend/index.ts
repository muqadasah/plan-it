import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import aiController from './controller/aiController';
import authController from './controller/authController';
import spaceController from './controller/spaceController';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = 3000;
app.use(express.json());

const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

app.use('/ai', aiController)
app.use('/auth', authController)
app.use('/space', spaceController)

app.get('/', (req: Request, res: Response) => {
  res.send('Plan it apis working');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
