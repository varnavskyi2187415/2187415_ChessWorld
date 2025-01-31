import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import {GetToken} from "../helpers/jwtHelper";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.isValidJwt(request);
  }
  
  private isValidJwt(request: any):boolean{
    const token = GetToken(request);
    const iseXp = this.isExpired(this.getExpirationDate(token)); 
    return !iseXp;
  }

  private getExpirationDate = (jwtToken:string) => {
    if (!jwtToken) {
      return null;
    }
    console.log("!!!!!!!!!!!!jwt", jwtToken);
    const jwt = JSON.parse(atob(jwtToken.split('.')[1]));

    return jwt && jwt.exp && jwt.exp * 1000 || null;
  };

  private isExpired = (exp) => {
    if (!exp) {
      return false;
    }

    return Date.now() > exp;
  };
}
