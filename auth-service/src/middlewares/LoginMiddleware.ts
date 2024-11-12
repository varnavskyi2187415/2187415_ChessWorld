import {User} from "../entity/User";
import readCredentials from "../utils/readCredentials";
import bcrypt from "bcrypt";

export default  module.exports = async (req: any, res: any, next: any) => {
    const {email, password} = req.body;

    if (!(email &&password)){
        return res.status(400).json({ message: 'Bad request' });
    }

    const user: User | null = await readCredentials(email);
    const passwordMatched = await bcrypt.compare(password, <string>user?.password);
    if (!passwordMatched) {
        return res.status(400).json({ message: 'Bad request', isPasswordMatch: passwordMatched });
    }

    next();
};