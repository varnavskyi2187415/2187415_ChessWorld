export interface Message {
  timeSent: string;
  message: string;
  roomId: string;
}

export interface ServerToClientEvents {
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (e: Message) => void;
  join_room: (e: { userId: string; roomName: string }) => void;
}