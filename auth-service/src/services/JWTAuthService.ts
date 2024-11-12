import {Service} from "typedi";
import {User} from "../entity/User";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

@Service()
export class JWTAuthService {

    private privateKey = fs.readFileSync(path.resolve(__dirname, "../config/jwt/keys/private.key"), "utf8");
    private publicKey = fs.readFileSync(path.resolve(__dirname, "../config/jwt/keys/public.key"), "utf8");

    public generateAccessJWT(user: User): string {
        const payload = {
            id: user.id,
            email: user.email,
        };

        const signOptions: jwt.SignOptions = {
            algorithm: "RS256",
            expiresIn: "15m",
        };

        return jwt.sign(payload, this.privateKey, signOptions);
    }

    public verifyJWT(token: string): any {
        try {
            return jwt.verify(token, this.publicKey, {algorithms: ["RS256"]});
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }
}
