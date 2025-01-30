import {Request, Response, Router} from 'express';
import {User} from "../entity/User";
import LoginMiddleware from "../middlewares/LoginMiddleware";
import {Container} from "typedi";
import {JWTAuthService} from "../services/JWTAuthService";
import {UserService} from "../services/UserService";

const AuthRouter = Router();

AuthRouter.post('/login', LoginMiddleware, async (req: Request, res: Response) => {
    const user: User | null = await  Container.get(UserService).getUser(req.body.email);
    if (!user){
        res.status(400).json({message:"There is no user with such an email"})
        return;
    }
    const refreshToken = await Container.get(JWTAuthService).generateRefreshJWT(user);

    const accessToken = Container.get(JWTAuthService).generateAccessJWT(user);

    res.status(201).json({message:"Authenticated", accessToken:accessToken, refreshToken:refreshToken.token})
});

AuthRouter.get('/refresh-access', async (req: Request, res: Response) => {
    if (!req.headers.authorization){
        res.status(400).json({message:"No token"})
        return;
    }

    const result = await Container.get(JWTAuthService).refreshAccessJWT(req.headers.authorization)

    if (!result){
        res.status(400).json({message:"Invalid token"});
        return;
    }

    res.status(201).json({message:"Authenticated", accessToken:result?.newAccess, refreshToken:result?.newRefresh})
});

export default AuthRouter;
