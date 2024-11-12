import {Service} from "typedi";
import {User} from "../entity/User";
import jwt, { Algorithm } from "jsonwebtoken";
import fs from "fs";
import path from "path";

@Service()
export class JWTAuthService {

    private algorithm: Algorithm = (process.env.JWT_ALGORITHM as Algorithm);
    private encoding: BufferEncoding = (process.env.JWT_FILE_CODING_TYPE as BufferEncoding);
    private privateKey = fs.readFileSync(path.resolve(__dirname, `${process.env.JWT_PRIVATE_KEY}`), this.encoding);
    private publicKey = fs.readFileSync(path.resolve(__dirname, `${process.env.JWT_PUBLIC_KEY}`), this.encoding);

    public generateAccessJWT(user: User): string {
        const payload = {
            id: user.id,
            email: user.email,
        };

        const signOptions: jwt.SignOptions = {
            algorithm: this.algorithm,
            expiresIn: process.env.JWT_TTL,
        };

        return jwt.sign(payload, this.privateKey, signOptions);
    }

    public verifyJWT(token: string): any {
        try {
            return jwt.verify(token, this.publicKey, {algorithms: [this.algorithm]});
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }
}
