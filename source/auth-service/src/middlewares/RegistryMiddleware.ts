import {validate} from "class-validator";
import {Container} from "typedi";
import {UserService} from "../services/UserService";

export default module.exports = async (req: any, res: any, next: any) => {

    const user = await Container.get(UserService).createUser(req.body);

    const errors = await validate(user);
    if (errors.length > 0) {
        const errorMessages = errors.map((err) => {
            return Object.values(err.constraints || {}).join(', ');
        });

        return res.status(400).json({
            message: 'Validation failed',
            errors: errorMessages
        });
    }

    next();
};