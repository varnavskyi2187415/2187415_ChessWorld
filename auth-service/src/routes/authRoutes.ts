import {Request, Response, Router} from 'express';

const router = Router();
router.get('/login', (req: Request, res: Response) => {
    res.send('Auth is done!');
});
router.post('/register', (req, res) => {
    res.send('User successfully created!');
});

export default router;
