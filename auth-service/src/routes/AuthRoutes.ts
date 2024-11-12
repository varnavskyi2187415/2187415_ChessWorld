import {Request, Response, Router} from 'express';
import {User} from "../entity/User";
import readCredentials from "../utils/readCredentials";
import LoginMiddleware from "../middlewares/LoginMiddleware";
import {Container} from "typedi";
import {JWTAuthService} from "../services/JWTAuthService";

const AuthRouter = Router();

AuthRouter.get('/login', LoginMiddleware, async (req: Request, res: Response) => {
    const user: User | null = await readCredentials(req.body.email);
    if (!user){
        res.status(400).json({message:"There is no user with such an email"})
        return;
    }
    const accessToken = Container.get(JWTAuthService).generateAccessJWT(user);
    res.status(201).json({message:"Authenticated", accessToken:accessToken})
});

export default AuthRouter;
