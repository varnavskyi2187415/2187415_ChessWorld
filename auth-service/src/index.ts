import "reflect-metadata";
import express from 'express';
import AuthRouter from './routes/AuthRoutes';
import {API_PREFIX} from './config';
import {AppDataSource} from "./data-source";
import UserRouter from "./routes/UserRouter";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(`/${API_PREFIX}`, AuthRouter, UserRouter);

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
