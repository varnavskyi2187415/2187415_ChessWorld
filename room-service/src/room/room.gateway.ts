import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

class StartGameRequest {
    userId: string;
}

@WebSocketGateway({
    namespace: "room",
    cors: {
        origin: '*',
    },
})
export class RoomGateway {

    @SubscribeMessage('find-game')
    handleMessage(@MessageBody() startGameRequest: StartGameRequest) {
        console.log(startGameRequest);
        return { msg: "Starting finding game" }
    }
}