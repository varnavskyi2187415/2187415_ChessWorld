import express from 'express';
import authRoutes from './routes/authRoutes';
import { API_PREFIX } from './config';
import "reflect-metadata";

import { AppDataSource } from "./data-source";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(`/${API_PREFIX}`, authRoutes);

async function startServer() {
    try {
        await AppDataSource.initialize();
        console.log("Data source has been initialized successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error during data source initialization:", error);
    }
}

startServer();
