import {User} from "../entity/User";
import bcrypt from "bcrypt";
import {Container} from "typedi";
import {UserService} from "../services/UserService";

export default  module.exports = async (req: any, res: any, next: any) => {
    const {email, password} = req.body;

    if (!(email && password)){
        return res.status(400).json({ message: 'Bad request' });
    }

    const user: User | null = await Container.get(UserService).getUser(email);
    if (!user){
        return res.status(400).json({message: 'Invalid email or password'});
    }
    const passwordMatched = await bcrypt.compare(password, <string>user?.password);
    if (!passwordMatched) {
        return res.status(400).json({ message: 'Bad request', isPasswordMatch: passwordMatched });
    }

    next();
};