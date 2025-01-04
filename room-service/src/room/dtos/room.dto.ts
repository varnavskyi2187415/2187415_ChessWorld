export class RoomDto {
  constructor(
    public id: string,
    public title: string,
    public whiteUserId: string,
    public blackUserId: string,
    public gamePGN: string,
    public gameStatus: string,
    public stockfishDepth: number
  ) {}
}
