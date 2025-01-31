import { UserDto } from "../../dto/user.dto";
import { getRedisClient } from "../../services/redis.service";
import { forwardMessageToRoomQueue } from "../rabbitmq.service";

export const handleFindGameMessage = async (message: any) => {
    const userDto = new UserDto(message.data.email, message.data.userId);
    const client = getRedisClient();
    console.log(message);
    await client.set(userDto.userId, userDto.email);

    const keys = await client.keys('*');
    const values = await client.mGet(keys);

    console.log('All values in Redis:', values);

    if (values.length >= 2) {
        const roomMessage = {
            pattern: "room-queue",
            data: {
                whiteId: keys[0],
                blackId: keys[1],
                timeControl: '10|10'
            }
        };

        forwardMessageToRoomQueue(roomMessage);

        await client.del(keys[0]);
        await client.del(keys[1]);
    }

    const value = await client.get(userDto.userId);
    console.log('Retrieved value from Redis:', value);
};
