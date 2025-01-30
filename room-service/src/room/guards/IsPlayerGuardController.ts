import {Injectable, CanActivate, ExecutionContext, Res} from '@nestjs/common';
import {Observable} from 'rxjs';
import {getRedisClient} from "../../utils/redis.service";
import {RoomService} from "../room.service";
import {GetUserId} from "../helpers/jwtHelper";

@Injectable()
export class IsPlayerGuardController implements CanActivate {
  constructor(private readonly roomService: RoomService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest() as Request;
    const userId = GetUserId(req.headers['authorization']);
    const roomId = req.url.split('/').pop();
    if (!userId || !roomId) {
      console.log("Undefined user tries to make user moves.")
      return false;
    }
    return this.roomService.isPlayer(userId, roomId);
  }
}
