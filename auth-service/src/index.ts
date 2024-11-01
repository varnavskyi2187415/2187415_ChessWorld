import express from 'express';
import authRoutes from './routes/authRoutes';
import { API_PREFIX } from './config';

const app = express();
const PORT = 3001;


app.use(`/${API_PREFIX}`, authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});