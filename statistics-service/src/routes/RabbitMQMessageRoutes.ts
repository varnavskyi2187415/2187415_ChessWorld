import {Request, Response, Router} from 'express';

import RabbitMqSendMessageMiddleware from "../middlewares/RabbitMqSendMessageMiddleware";
import {forwardMessageToRoomQueue} from "../rabbitmq/rabbitmq.service";

const RabbitMQMessageRouter = Router();

RabbitMQMessageRouter.post('/send-message-to-room', RabbitMqSendMessageMiddleware, async (req: Request, res: Response) => {
    forwardMessageToRoomQueue(req.body);
    res.status(201).json({
        message: 'Info has been sent',
        data: req.body
    });
});

export default RabbitMQMessageRouter;
