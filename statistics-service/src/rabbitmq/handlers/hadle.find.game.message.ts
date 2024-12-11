import {UserDto} from "../../dto/user.dto";

export const handleFindGameMessage = (message: any) => {
    const userDto = new UserDto(message.data.email, message.data.userId);


};