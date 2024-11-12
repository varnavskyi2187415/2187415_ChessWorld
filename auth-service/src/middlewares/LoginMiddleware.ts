export default module.exports = (req: any, res: any, next: any) => {
    const {email, password} = req.body;
    if (!email && !password){
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    next();
};