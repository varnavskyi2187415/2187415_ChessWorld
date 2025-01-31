import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Service} from "typedi";
import {Token} from "../entity/Token";

@Service()
export class TokenService {

    public async createToken({user, token}: { user: User, token: string}) {
        const entity = new Token();

        entity.user = user;
        entity.token = token;

        return entity;
    }

    public async getTokens(user: User) {
        const tokenRepository = AppDataSource.getRepository(Token);
        return await tokenRepository.findBy({ user: { id: user.id } });
    }

    public async saveToken(token: Token) {
        const tokenRepository = AppDataSource.getRepository(Token);
        await tokenRepository.save(token);

        return token;
    }
}
