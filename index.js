import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import AuthRoutes from './routes/authRoutes.js';
import ZoomSdkRoutes from './routes/zoomSdkRoutes.js';
import cookieSession from 'cookie-session';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 8888;
const application = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

application.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY],
  maxAge: 24 * 60 * 60 * 1000
}));

application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cors());
application.use(cors({
    origin: ['http://localhost:3000'], // your frontend origin(s)
    credentials: true
  }));

// your existing Zoom OAuth / user / list routes
application.use('/', AuthRoutes);

// new Meeting SDK routes
application.use('/', ZoomSdkRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, 'client', 'build');
  application.use(express.static(clientBuildPath));
  application.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

application.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
