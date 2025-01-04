export interface Room {
  id: string
  title: string
  gamePGN: string
  gameStatus: string
  attendees: Attendee[]
  whiteUserId?: string,
  blackUserId?: string,
  whiteTime: number,
  blackTime: number,
}

export interface Attendee {
  id: string
  userId: string
  isPlayer: boolean
  socketId: string
}
