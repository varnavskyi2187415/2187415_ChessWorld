import {UserDto} from "../../dto/user.dto";
import {getRedisClient} from "../../services/redis.service";

export const handleFindGameMessage = async (message: any) => {
    const userDto = new UserDto(message.data.email, message.data.userId);
    const client = getRedisClient();

    await client.set(userDto.userId, userDto.email);
    const keys = await client.keys('*');
    const values = await client.mGet(keys);

    console.log(values[0]);
    const value = await client.get(userDto.userId);

    console.log('Retrieved value from Redis:', value);
};