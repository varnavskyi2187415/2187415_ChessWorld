import {Request, Response, Router} from 'express';
import {User} from "../entity/User";
import {EntityManager} from "typeorm";
import {AppDataSource} from "../data-source";
import {validate, validateSync} from "class-validator";
import bcrypt from 'bcrypt';
import readCredentials from "../utils/getUserByEmail";


const router = Router();

router.get('/login',  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user : User | null = await readCredentials(email);
    const passwordMatched = await bcrypt.compare(password, <string>user?.password);

    res.json("Invalid credentials");

    if(passwordMatched) {
        res.json({isPasswordMatch:passwordMatched});
    }
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    const user = new User();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    const errors = validateSync(user);

    if (errors.length > 0) {
        console.log(`Validation failed!`)
        res.status(400).json(`Validation failed!`);
    } else {
        console.log("Validation succeed")
        res.status(201).json("Validation succeed");
    }

    //res.status(200).json({});
});

export default router;
