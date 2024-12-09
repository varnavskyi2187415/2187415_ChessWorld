import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';

let channel: Channel;
let connection: Connection;

export const connectRabbitMQClient = async (): Promise<void> => {
    try {
        const connectionUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672/`;

        connection = await amqp.connect(connectionUrl);
        channel = await connection.createChannel();

        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
        process.exit(1);
    }
};

export const subscribeToQueue = (queueName: string, callback: (msg: any) => void): void => {
    try {
        channel.consume(queueName, (msg: ConsumeMessage | null) => {
            if (msg) {
                const message = JSON.parse(msg.content.toString());
                callback(message);
                channel.ack(msg);
            }
        });

        console.log(`Subscribed to queue: ${queueName}`);
    } catch (error) {
        console.error("Error subscribing to RabbitMQ queue:", error);
    }
};

export const forwardMessageToRoomQueue = (message: any): void => {
    try {
        const queueName = 'room-queue';
        const messageBuffer = Buffer.from(JSON.stringify(message));

        channel.sendToQueue(queueName, messageBuffer);
    } catch (error) {
        console.error("Error forwarding message to room-queue:", error);
    }
};