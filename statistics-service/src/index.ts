import express from 'express';
import { connectRabbitMQClient, subscribeToQueue } from './rabbitmq/rabbitmq.service';
import { AppDataSource } from "./data-source";
import RabbitMQMessageRouter from './routes/RabbitMQMessageRoutes';
import { API_PREFIX } from './config';
import {handleRabbitMQMessage} from "./rabbitmq/handlers/handle.rabbitmq.message";
import {handleFindGameMessage} from "./rabbitmq/handlers/hadle.find.game.message";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(`/${API_PREFIX}`, RabbitMQMessageRouter);

async function startServer() {
    try {
        await AppDataSource.initialize();

        await connectRabbitMQClient();

        subscribeToQueue('statistics-queue', handleRabbitMQMessage);
        subscribeToQueue('find-game-queue', handleFindGameMessage);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

startServer();
