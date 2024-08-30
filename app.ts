import express, { Application } from 'express';
import path from 'path';
import askRoutes from './routes/ask';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import swaggerDocs from './swagger';

dotenv.config();

const app: Application = express();
const port: string | number = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

swaggerDocs(app, port);

//routes personalisés
app.use('/api/ask', askRoutes);

export default app;
