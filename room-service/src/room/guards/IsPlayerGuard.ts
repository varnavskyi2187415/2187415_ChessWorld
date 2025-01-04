import {Injectable, CanActivate, ExecutionContext, Res} from '@nestjs/common';
import {Observable} from 'rxjs';
import {getRedisClient} from "../../utils/redis.service";
import {RoomService} from "../room.service";

@Injectable()
export class IsPlayerGuard implements CanActivate {
  constructor(private readonly roomService: RoomService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const wsContext = context.switchToWs();
    const socketData = wsContext.getClient().data;
    const data = wsContext.getData();
    if (!socketData.userId || !data.roomId) {
      console.log("Undefined user tries to make user moves.")
      return false;
    }
    const redisClient = getRedisClient();
    return redisClient.get(`${socketData.userId}|${data.roomId}`).then((result) => {
      console.log('result', result);
      if (result === '0') {
        return false;
      } else if (result === '1') {
        return true;
      }
      return this.roomService.isPlayerInRoom(socketData.userId, data.roomId).then((result) => {
        redisClient.set(`${socketData.userId}|${data.roomId}`, result ? '1' : '0', {EX: 300})
          .catch(e => console.log('SET ERROR', e));
        return result;
      }).catch(e => {
        console.log('QUERY ERROR', e);
        return false;
      })
    }).catch(e => {
      console.log('GET ERROR', e);
      return false;
    });
  }
}
