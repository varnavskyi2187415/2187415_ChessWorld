import {AppDataSource} from "../data-source";
import {User} from "../entity/User";

async function readCredentials(email: string): Promise<User | null> {
    const userRepository = AppDataSource.manager.getRepository(User);

    // @ts-ignore
    const user = await userRepository.findOneBy({_email: email});

    return user || null;
}

export default readCredentials;
