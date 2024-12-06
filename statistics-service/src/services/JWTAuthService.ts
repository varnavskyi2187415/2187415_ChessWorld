import {Container, Service} from "typedi";
import {User} from "../entity/User";
import jwt, {JwtPayload} from "jsonwebtoken";
import fs from "fs";
import path from "path";
import {TokenService} from "./TokenService";
import {UserService} from "./UserService";

@Service()
export class JWTAuthService {

    private privateKey = fs.readFileSync(path.resolve(__dirname, "../config/jwt/keys/private.key"), "utf8");
    private publicKey = fs.readFileSync(path.resolve(__dirname, "../config/jwt/keys/public.key"), "utf8");
    private signOptions: jwt.SignOptions = {
        algorithm: "RS256",
        expiresIn: "15d",
    };

    private generateJWT(user: User, isRefresh: boolean): string {
        const payload = {
            id: user.id,
            email: user.email,
            isRefresh,
        };
        return jwt.sign(payload, this.privateKey, this.signOptions);
    }

    public async createRefreshJWT(user: User): Promise<string> {
        return this.generateJWT(user, true);
    }

    public generateAccessJWT(user: User): string {
        return this.generateJWT(user, false);
    }

    public async generateRefreshJWT(user: User) {
        const token = await this.createRefreshJWT(user);

        const tokenService = Container.get(TokenService);
        const entityToken = await tokenService.createToken({ user, token });

        return await tokenService.saveToken(entityToken);
    }

    public async refreshAccessJWT(token: string) {
        const refreshTokenEntity = await this.validateRefresh(token);
        if (!refreshTokenEntity) {
            return null;
        }

        const { user, token: foundToken } = refreshTokenEntity;
        const newRefresh = await this.createRefreshJWT(user);
        const newAccess = this.generateAccessJWT(user);

        foundToken.token = newRefresh;

        // Оновлюємо токен в базі
        const tokenSaved = await Container.get(TokenService).saveToken(foundToken);
        if (!tokenSaved) return null;

        return { newRefresh, newAccess };
    }

    public async validateRefresh(token: string) {
        if (!token) return null;

        const refreshPayload = jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as JwtPayload;

        if (!refreshPayload || !refreshPayload["isRefresh"]) {
            return null;
        }

        const userService = Container.get(UserService);
        const user: User = await userService.getUser(refreshPayload["email"]);
        if (!user) return null;

        return await this.validateUserAndToken(user, token);
    }

    private async validateUserAndToken(user: User, token: string): Promise<{ user: User, token: any } | null> {
        const tokenService = Container.get(TokenService);
        const userTokens = await tokenService.getTokens(user);

        if (userTokens.length === 0) return null;

        const foundToken = userTokens.find((userToken) => userToken.token === token);
        if (!foundToken) return null;

        return { user, token: foundToken };
    }
}
