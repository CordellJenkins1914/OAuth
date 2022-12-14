import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import AuthRoutes from './routes/authRoutes.js';
import cookieSession from 'cookie-session';
import generateRandomString from "./utils/generateRandomString.js";

const PORT = process.env.PORT || 8888;
const application = express();
application.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_KEY],
  
    // Cookie Options
    maxAge:  24 * 60 * 60 * 1000 // 24 hours
  }))
if(process.env.NODE_ENV == 'production'){
    application.use(express.static('client/build'))
}
application.use(express.json());
application.use(express.urlencoded({extended: true}));
application.use(cors());
application.use('/', AuthRoutes);




application.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});