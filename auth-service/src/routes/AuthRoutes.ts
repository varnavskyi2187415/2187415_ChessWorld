import {Request, Response, Router} from 'express';
import {User} from "../entity/User";
import bcrypt from 'bcrypt';
import readCredentials from "../utils/getUserByEmail";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const AuthRouter = Router();

AuthRouter.get('/login', AuthMiddleware, async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const user: User | null = await readCredentials(email);
    const passwordMatched = await bcrypt.compare(password, <string>user?.password);

    if (passwordMatched) {
        res.json({isPasswordMatch: passwordMatched});
        return;
    }

    res.json({message:"Invalid credentials", isPasswordMatch: passwordMatched});
});

export default AuthRouter;
