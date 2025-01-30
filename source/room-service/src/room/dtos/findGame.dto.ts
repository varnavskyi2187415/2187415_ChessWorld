export class FindGameDto {
  constructor(
    public email: string,
    public userId: string,
    public timeControl?: string,
  ) {}
}
