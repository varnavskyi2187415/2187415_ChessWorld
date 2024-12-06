import bcrypt from 'bcrypt';
import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Service} from "typedi";

@Service()
export class UserService {

    public async createUser({name, email, password}: { name: string, email: string, password: string }) {
        const user = new User();
        user.name = name;
        user.email = email;
        user.password = password;

        return user;
    }

    public async getUser(email: string): Promise<User> {
        const userRepository = AppDataSource.manager.getRepository(User);

        // @ts-ignore
        return await userRepository.findOneBy({email});
    }

    public async saveUser(user: User) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.save(user);

        return user;
    }
}
