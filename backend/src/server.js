import 'dotenv/config';
import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import executeRoutes from './routes/executeRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import { attachInteractiveExecution } from './services/executor/interactiveSocket.js';

const app = express();
const server = createServer(app);
attachInteractiveExecution(server);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/invitations', invitationRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const port = process.env.PORT || 5001;

connectDB()
  .then(() => server.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
