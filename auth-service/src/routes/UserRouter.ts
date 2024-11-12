import {Request, Response, Router} from "express";
import {UserService} from "../services/UserService";
import {Container} from 'typedi';
import {User} from "../entity/User";
import RegistryMiddleware from "../middlewares/RegistryMiddleware";

const UserRouter = Router();

UserRouter.post('/register', RegistryMiddleware, async (req: Request, res: Response): Promise<void> => {
    const user: User = await Container.get(UserService).createUser(req.body);

    const savedUser = await Container.get(UserService).saveUser(user);
    res.status(201).json({
        message: 'User successfully created',
        user: savedUser
    });
});

export default UserRouter;