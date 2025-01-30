import {Injectable, CanActivate, ExecutionContext, Res} from '@nestjs/common';
import {Observable} from 'rxjs';
import {getRedisClient} from "../../utils/redis.service";
import {RoomService} from "../room.service";

@Injectable()
export class IsPlayerGuardGateway implements CanActivate {
  constructor(private readonly roomService: RoomService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const wsContext = context.switchToWs();
    const {userId} = wsContext.getClient().data;
    const {roomId} = wsContext.getData();
    if (!userId || !roomId) {
      console.log("Undefined user tries to make user moves.")
      return false;
    }
    return this.roomService.isPlayer(userId, roomId);
  }
}
